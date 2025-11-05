-- Ensure PostgREST reloads the schema so the new dashboard_data table becomes available immediately
NOTIFY pgrst, 'reload schema';
