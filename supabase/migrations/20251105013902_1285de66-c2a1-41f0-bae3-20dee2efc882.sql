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