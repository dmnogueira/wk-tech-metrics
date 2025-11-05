-- Create dashboard_data table
CREATE TABLE IF NOT EXISTS public.dashboard_data (
  id text primary key default 'dashboard-config',
  data jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view dashboard data"
  ON public.dashboard_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can upsert dashboard data"
  ON public.dashboard_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

CREATE POLICY "Admins can update dashboard data"
  ON public.dashboard_data
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

CREATE POLICY "Admins can delete dashboard data"
  ON public.dashboard_data
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

-- Create trigger for automatic timestamp updates
CREATE TRIGGER set_updated_at_dashboard_data
  BEFORE UPDATE ON public.dashboard_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to get dashboard data
CREATE OR REPLACE FUNCTION public.get_dashboard_data()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(data, '{}'::jsonb)
  FROM public.dashboard_data
  WHERE id = 'dashboard-config'
  LIMIT 1;
$$;

-- Create function to upsert dashboard data
CREATE OR REPLACE FUNCTION public.upsert_dashboard_data(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_data jsonb;
BEGIN
  INSERT INTO public.dashboard_data (id, data)
  VALUES ('dashboard-config', p_data)
  ON CONFLICT (id) DO UPDATE
    SET data = EXCLUDED.data,
        updated_at = timezone('utc', now());
  
  SELECT data INTO result_data
  FROM public.dashboard_data
  WHERE id = 'dashboard-config';
  
  RETURN result_data;
END;
$$;