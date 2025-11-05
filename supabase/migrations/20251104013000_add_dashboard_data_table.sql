-- Create table to persist dashboard configuration data
create table if not exists public.dashboard_data (
  id text primary key default 'dashboard-config',
  data jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.dashboard_data enable row level security;

create policy "Authenticated users can view dashboard data"
  on public.dashboard_data
  for select
  to authenticated
  using (true);

create policy "Admins can upsert dashboard data"
  on public.dashboard_data
  for insert
  to authenticated
  with check (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'master')
  );

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

create policy "Admins can delete dashboard data"
  on public.dashboard_data
  for delete
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'master')
  );

create trigger set_updated_at_dashboard_data
  before update on public.dashboard_data
  for each row
  execute function public.handle_updated_at();
