import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import postgres from "https://deno.land/x/postgresjs@v3.3.5/mod.js";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
};

const dashboardDataSchema = z.object({
  data: z.record(z.any()).default({}),
});

type DashboardDataPayload = z.infer<typeof dashboardDataSchema>;

type PostgresClient = ReturnType<typeof postgres>;

async function ensureDashboardTable(sql: PostgresClient) {
  await sql`
    create table if not exists public.dashboard_data (
      id text primary key default 'dashboard-config',
      data jsonb not null,
      created_at timestamptz not null default timezone('utc', now()),
      updated_at timestamptz not null default timezone('utc', now())
    )
  `;

  await sql`alter table public.dashboard_data enable row level security;`;

  await sql`
    do $$
    begin
      if not exists (
        select 1 from pg_policies
        where polname = 'Authenticated users can view dashboard data'
          and tablename = 'dashboard_data'
          and schemaname = 'public'
      ) then
        create policy "Authenticated users can view dashboard data"
          on public.dashboard_data
          for select
          to authenticated
          using (true);
      end if;
    end;
    $$;
  `;

  await sql`
    do $$
    begin
      if not exists (
        select 1 from pg_policies
        where polname = 'Admins can upsert dashboard data'
          and tablename = 'dashboard_data'
          and schemaname = 'public'
      ) then
        create policy "Admins can upsert dashboard data"
          on public.dashboard_data
          for insert
          to authenticated
          with check (
            public.has_role(auth.uid(), 'admin')
            or public.has_role(auth.uid(), 'master')
          );
      end if;
    end;
    $$;
  `;

  await sql`
    do $$
    begin
      if not exists (
        select 1 from pg_policies
        where polname = 'Admins can update dashboard data'
          and tablename = 'dashboard_data'
          and schemaname = 'public'
      ) then
        create policy "Admins can update dashboard data"
          on public.dashboard_data
          for update
          to authenticated
          using (
            public.has_role(auth.uid(), 'admin')
            or public.has_role(auth.uid(), 'master')
          )
          with check (
            public.has_role(auth.uid(), 'admin')
            or public.has_role(auth.uid(), 'master')
          );
      end if;
    end;
    $$;
  `;

  await sql`
    do $$
    begin
      if not exists (
        select 1 from pg_policies
        where polname = 'Admins can delete dashboard data'
          and tablename = 'dashboard_data'
          and schemaname = 'public'
      ) then
        create policy "Admins can delete dashboard data"
          on public.dashboard_data
          for delete
          to authenticated
          using (
            public.has_role(auth.uid(), 'admin')
            or public.has_role(auth.uid(), 'master')
          );
      end if;
    end;
    $$;
  `;

  await sql`
    do $$
    begin
      if not exists (
        select 1
        from pg_trigger
        where tgname = 'set_updated_at_dashboard_data'
      ) then
        create trigger set_updated_at_dashboard_data
          before update on public.dashboard_data
          for each row
          execute function public.handle_updated_at();
      end if;
    end;
    $$;
  `;
}

async function getUserRoles(sql: PostgresClient, userId: string) {
  const rows = await sql<{ role: string }[]>`
    select role
    from public.user_roles
    where user_id = ${userId}
  `;

  return rows.map((row) => row.role);
}

function isAdmin(roles: string[]) {
  return roles.includes("admin") || roles.includes("master");
}

async function fetchDashboardData(sql: PostgresClient) {
  const rows = await sql<{ data: unknown }[]>`
    select data
    from public.dashboard_data
    where id = 'dashboard-config'
  `;

  return (rows[0]?.data as Record<string, unknown>) ?? {};
}

async function upsertDashboardData(sql: PostgresClient, payload: DashboardDataPayload) {
  await sql`
    insert into public.dashboard_data (id, data)
    values ('dashboard-config', ${payload.data}::jsonb)
    on conflict (id) do update
      set data = excluded.data,
          updated_at = timezone('utc', now())
  `;

  return fetchDashboardData(sql);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const databaseUrl = Deno.env.get("SUPABASE_DB_URL") ?? "";

  if (!supabaseUrl || !serviceRoleKey || !databaseUrl) {
    return new Response(JSON.stringify({ error: "Configuração inválida" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sql: PostgresClient | null = null;

  try {
    sql = postgres(databaseUrl, {
      transform: {
        column(value) {
          return value;
        },
      },
      idle_timeout: 2,
      onnotice: () => {},
      ssl: { rejectUnauthorized: false },
    });

    await ensureDashboardTable(sql);

    if (req.method === "GET") {
      const data = await fetchDashboardData(sql);
      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const roles = await getUserRoles(sql, user.id);

      if (!isAdmin(roles)) {
        return new Response(JSON.stringify({ error: "Permissão negada" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const rawBody = await req.json();
      const payload = dashboardDataSchema.parse(rawBody);

      const data = await upsertDashboardData(sql, payload);

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro na função dashboard-data:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    try {
      await sql?.end({ timeout: 1 });
    } catch (endError) {
      console.error("Erro ao encerrar conexão com o banco:", endError);
    }
  }
});
