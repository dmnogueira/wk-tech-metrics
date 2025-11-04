-- Add is_management field to positions table
ALTER TABLE public.positions
ADD COLUMN is_management BOOLEAN NOT NULL DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN public.positions.is_management IS 'Indicates if this position is a management role';