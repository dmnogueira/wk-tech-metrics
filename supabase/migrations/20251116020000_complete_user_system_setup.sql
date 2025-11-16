-- WK.metrics - Complete User System Setup
-- This migration creates ALL necessary tables and RLS policies for user management

-- ============================================================================
-- PART 1: CREATE ENUM AND TABLES
-- ============================================================================

-- Create enum for roles (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('master', 'admin', 'gestao', 'usuario');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create positions (cargos) table
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create squads table
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create professionals table
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL,
  seniority TEXT CHECK (seniority IN ('Júnior', 'Pleno', 'Sênior', 'Especialista')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (profile_id)
);

-- ============================================================================
-- PART 2: ENABLE RLS
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: CREATE HELPER FUNCTION
-- ============================================================================

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================================================
-- PART 4: DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================================================

-- user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;

-- profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- positions policies
DROP POLICY IF EXISTS "Anyone can view positions" ON public.positions;
DROP POLICY IF EXISTS "Only admins can insert positions" ON public.positions;
DROP POLICY IF EXISTS "Only admins can update positions" ON public.positions;
DROP POLICY IF EXISTS "Only admins can delete positions" ON public.positions;
DROP POLICY IF EXISTS "Authenticated users can insert positions" ON public.positions;
DROP POLICY IF EXISTS "Authenticated users can update positions" ON public.positions;
DROP POLICY IF EXISTS "Authenticated users can delete positions" ON public.positions;

-- squads policies
DROP POLICY IF EXISTS "Anyone can view squads" ON public.squads;
DROP POLICY IF EXISTS "Admins and managers can insert squads" ON public.squads;
DROP POLICY IF EXISTS "Admins and managers can update squads" ON public.squads;
DROP POLICY IF EXISTS "Only admins can delete squads" ON public.squads;
DROP POLICY IF EXISTS "Authenticated users can insert squads" ON public.squads;
DROP POLICY IF EXISTS "Authenticated users can update squads" ON public.squads;

-- professionals policies
DROP POLICY IF EXISTS "Anyone can view professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins and managers can insert professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins and managers can update professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins and managers can delete professionals" ON public.professionals;
DROP POLICY IF EXISTS "Authenticated users can insert professionals" ON public.professionals;
DROP POLICY IF EXISTS "Authenticated users can update professionals" ON public.professionals;
DROP POLICY IF EXISTS "Authenticated users can delete professionals" ON public.professionals;

-- ============================================================================
-- PART 5: CREATE PERMISSIVE RLS POLICIES
-- ============================================================================

-- RLS Policies for user_roles (viewing)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for positions
CREATE POLICY "Anyone can view positions"
  ON public.positions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert positions"
  ON public.positions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update positions"
  ON public.positions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete positions"
  ON public.positions FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for squads
CREATE POLICY "Anyone can view squads"
  ON public.squads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert squads"
  ON public.squads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update squads"
  ON public.squads FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete squads"
  ON public.squads FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for professionals
CREATE POLICY "Anyone can view professionals"
  ON public.professionals FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert professionals"
  ON public.professionals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update professionals"
  ON public.professionals FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete professionals"
  ON public.professionals FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- PART 6: CREATE TRIGGERS
-- ============================================================================

-- Create or replace handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_positions ON public.positions;
CREATE TRIGGER set_updated_at_positions
  BEFORE UPDATE ON public.positions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_squads ON public.squads;
CREATE TRIGGER set_updated_at_squads
  BEFORE UPDATE ON public.squads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_professionals ON public.professionals;
CREATE TRIGGER set_updated_at_professionals
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- PART 7: SEED DEFAULT DATA
-- ============================================================================

-- Seed positions
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

-- ============================================================================
-- PART 8: ASSIGN ADMIN ROLE TO EXISTING USER
-- ============================================================================

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
    
    RAISE NOTICE '✅ Admin role assigned to user: %', v_user_id;
  ELSE
    RAISE NOTICE '⚠️  User denilson.nogueira@wk.com.br not found in auth.users';
  END IF;
END $$;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_positions_count INTEGER;
  v_user_roles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_positions_count FROM public.positions;
  SELECT COUNT(*) INTO v_user_roles_count FROM public.user_roles;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ WK.metrics User System Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 Tables created:';
  RAISE NOTICE '   - user_roles';
  RAISE NOTICE '   - profiles';
  RAISE NOTICE '   - positions';
  RAISE NOTICE '   - squads';
  RAISE NOTICE '   - professionals';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 RLS policies: PERMISSIVE (all authenticated users)';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Data seeded:';
  RAISE NOTICE '   - Positions: % records', v_positions_count;
  RAISE NOTICE '   - User roles: % records', v_user_roles_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  For production: consider restricting RLS policies';
  RAISE NOTICE '========================================';
END $$;
