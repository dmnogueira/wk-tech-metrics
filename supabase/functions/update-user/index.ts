import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const updateUserSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  full_name: z.string().min(1, "Nome obrigatório").max(100, "Nome muito longo").trim(),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  is_admin: z.boolean()
});

interface UpdateUserRequest {
  userId: string;
  full_name: string;
  email: string;
  is_admin: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autenticação não fornecido");
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user is authenticated and is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Check if user has admin or master role
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      console.error("Erro ao verificar permissões:", rolesError);
      throw new Error("Erro ao verificar permissões");
    }

    const isAdmin = roles?.some(r => r.role === "admin" || r.role === "master");
    if (!isAdmin) {
      throw new Error("Permissão negada. Apenas administradores podem atualizar usuários.");
    }

    // Parse and validate input
    const rawData = await req.json();
    const validatedData = updateUserSchema.parse(rawData);
    const { userId, full_name, email, is_admin } = validatedData;

    console.log(`Admin ${user.email} updating user ${userId}`);

    // Update profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: full_name,
        email: email,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Erro ao atualizar perfil:", profileError);
      throw new Error("Erro ao atualizar perfil do usuário");
    }

    // Get existing roles
    const { data: existingRoles } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .in("role", ["admin", "master"]);

    const hasAdminRole = existingRoles && existingRoles.length > 0;

    // Update admin role if changed
    if (is_admin && !hasAdminRole) {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });

      if (roleError) {
        console.error("Erro ao adicionar role admin:", roleError);
        throw new Error("Erro ao adicionar permissões de administrador");
      }
      console.log(`Added admin role to user ${userId}`);
    } else if (!is_admin && hasAdminRole) {
      // Only remove admin role, not master role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");

      if (roleError) {
        console.error("Erro ao remover role admin:", roleError);
        throw new Error("Erro ao remover permissões de administrador");
      }
      console.log(`Removed admin role from user ${userId}`);
    }

    console.log(`User ${userId} updated successfully by ${user.email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Usuário atualizado com sucesso"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro na função update-user:", error);
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "Dados inválidos",
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
