-- Provide RPC helpers for managing dashboard data without relying on PostgREST table metadata
create or replace function public.get_dashboard_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado' using errcode = 'P0001';
  end if;

  select data into result
  from public.dashboard_data
  where id = 'dashboard-config';

  return coalesce(result, '{}'::jsonb);
end;
$$;

comment on function public.get_dashboard_data is 'Retorna a configuração atual do dashboard para usuários autenticados.';

create or replace function public.upsert_dashboard_data(p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado' using errcode = 'P0001';
  end if;

  if not (public.has_role(current_user_id, 'admin') or public.has_role(current_user_id, 'master')) then
    raise exception 'Permissão negada' using errcode = 'P0001';
  end if;

  insert into public.dashboard_data as dd (id, data)
  values ('dashboard-config', coalesce(p_data, '{}'::jsonb))
  on conflict (id) do update
    set data = excluded.data,
        updated_at = now();

  return (
    select data
    from public.dashboard_data
    where id = 'dashboard-config'
  );
end;
$$;

comment on function public.upsert_dashboard_data is 'Atualiza a configuração do dashboard, restrito a administradores e masters.';

grant execute on function public.get_dashboard_data to authenticated;
grant execute on function public.upsert_dashboard_data to authenticated;
grant execute on function public.upsert_dashboard_data to service_role;

notify pgrst, 'reload schema';
