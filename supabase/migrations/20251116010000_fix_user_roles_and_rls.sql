-- Fix User Roles and RLS Policies for WK.metrics
-- This migration assigns admin role to existing user and creates more permissive policies

-- 1. Assign 'admin' role to the existing user (denilson.nogueira@wk.com.br)
-- Note: We'll use the email to find the user_id from auth.users
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id for denilson.nogueira@wk.com.br
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'denilson.nogueira@wk.com.br'
  LIMIT 1;

  -- If user exists, assign admin role
  IF v_user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role assigned to user: %', v_user_id;
  ELSE
    RAISE NOTICE 'User denilson.nogueira@wk.com.br not found in auth.users';
  END IF;
END $$;

-- 2. Create more permissive RLS policies for squads (allow all authenticated users to manage)
-- This is useful for initial setup and can be restricted later

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins and managers can insert squads" ON public.squads;
DROP POLICY IF EXISTS "Admins and managers can update squads" ON public.squads;

-- Create new permissive policies (all authenticated users can insert/update)
CREATE POLICY "Authenticated users can insert squads"
  ON public.squads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update squads"
  ON public.squads FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Keep the restrictive delete policy (only admins)
-- (Already exists: "Only admins can delete squads")

-- 3. Update professionals policies to be more permissive
DROP POLICY IF EXISTS "Admins and managers can insert professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins and managers can update professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins and managers can delete professionals" ON public.professionals;

CREATE POLICY "Authenticated users can insert professionals"
  ON public.professionals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update professionals"
  ON public.professionals FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete professionals"
  ON public.professionals FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- 4. Update profiles policies to allow authenticated users to create profiles for others
-- (Currently only allows users to insert their own profile)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Authenticated users can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Keep the update policy restricted to own profile
-- (Already exists: "Users can update own profile")

-- 5. Update positions policies to be more permissive
DROP POLICY IF EXISTS "Only admins can insert positions" ON public.positions;
DROP POLICY IF EXISTS "Only admins can update positions" ON public.positions;
DROP POLICY IF EXISTS "Only admins can delete positions" ON public.positions;

CREATE POLICY "Authenticated users can insert positions"
  ON public.positions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update positions"
  ON public.positions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete positions"
  ON public.positions FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- 6. Seed some initial positions if they don't exist
INSERT INTO public.positions (name, description)
VALUES 
  ('Desenvolvedor', 'Desenvolvedor de Software'),
  ('Tech Lead', 'Líder Técnico'),
  ('Product Owner', 'Dono do Produto'),
  ('Scrum Master', 'Facilitador Ágil'),
  ('Designer', 'Designer de Produto'),
  ('Analista de QA', 'Analista de Qualidade'),
  ('DevOps', 'Engenheiro DevOps'),
  ('Arquiteto', 'Arquiteto de Software')
ON CONFLICT (name) DO NOTHING;

-- Log summary
DO $$
BEGIN
  RAISE NOTICE '✅ User roles and RLS policies updated successfully';
  RAISE NOTICE '✅ More permissive policies created for initial setup';
  RAISE NOTICE '✅ 8 default positions seeded';
  RAISE NOTICE '⚠️  Consider restricting policies again after initial setup';
END $$;
