-- Ensure REST clients can access dashboard_data via PostgREST
grant usage on schema public to anon, authenticated;

grant select on table public.dashboard_data to anon;

grant select, insert, update, delete on table public.dashboard_data to authenticated;

grant all on table public.dashboard_data to service_role;

notify pgrst, 'reload schema';
