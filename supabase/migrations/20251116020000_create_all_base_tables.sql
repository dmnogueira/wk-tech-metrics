-- WK.metrics - Criação Completa de Tabelas Base
-- Esta migration cria TODAS as tabelas necessárias do zero
-- Se alguma já existir, será ignorada (CREATE TABLE IF NOT EXISTS)

-- =============================================================================
-- 1. TIPOS ENUM
-- =============================================================================

-- Criar tipo para roles (se não existir)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('master', 'admin', 'gestao', 'usuario');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 2. TABELAS DE USUÁRIOS E ROLES
-- =============================================================================

-- Tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela positions (cargos)
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela squads
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela professionals
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

-- =============================================================================
-- 3. HABILITAR RLS EM TODAS AS TABELAS
-- =============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. FUNÇÕES AUXILIARES
-- =============================================================================

-- Função para verificar roles
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

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. RLS POLICIES (PERMISSIVAS PARA DESENVOLVIMENTO)
-- =============================================================================

-- RLS Policies para user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master'));

-- RLS Policies para profiles (PERMISSIVAS)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;
CREATE POLICY "Authenticated users can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies para positions (PERMISSIVAS)
DROP POLICY IF EXISTS "Anyone can view positions" ON public.positions;
CREATE POLICY "Anyone can view positions"
  ON public.positions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert positions" ON public.positions;
CREATE POLICY "Authenticated users can insert positions"
  ON public.positions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update positions" ON public.positions;
CREATE POLICY "Authenticated users can update positions"
  ON public.positions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete positions" ON public.positions;
CREATE POLICY "Authenticated users can delete positions"
  ON public.positions FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies para squads (PERMISSIVAS)
DROP POLICY IF EXISTS "Anyone can view squads" ON public.squads;
CREATE POLICY "Anyone can view squads"
  ON public.squads FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert squads" ON public.squads;
CREATE POLICY "Authenticated users can insert squads"
  ON public.squads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update squads" ON public.squads;
CREATE POLICY "Authenticated users can update squads"
  ON public.squads FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Only admins can delete squads" ON public.squads;
CREATE POLICY "Only admins can delete squads"
  ON public.squads FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master'));

-- RLS Policies para professionals (PERMISSIVAS)
DROP POLICY IF EXISTS "Anyone can view professionals" ON public.professionals;
CREATE POLICY "Anyone can view professionals"
  ON public.professionals FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert professionals" ON public.professionals;
CREATE POLICY "Authenticated users can insert professionals"
  ON public.professionals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update professionals" ON public.professionals;
CREATE POLICY "Authenticated users can update professionals"
  ON public.professionals FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete professionals" ON public.professionals;
CREATE POLICY "Authenticated users can delete professionals"
  ON public.professionals FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- 6. TRIGGERS PARA updated_at
-- =============================================================================

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

-- =============================================================================
-- 7. SEED DE DADOS INICIAIS
-- =============================================================================

-- Seed de Positions
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

-- Atribuir role 'admin' ao usuário denilson.nogueira@wk.com.br
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'denilson.nogueira@wk.com.br'
  LIMIT 1;

  -- Se usuário existe, atribuir role admin
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE '✅ Admin role assigned to user: %', v_user_id;
  ELSE
    RAISE NOTICE '⚠️  User denilson.nogueira@wk.com.br not found in auth.users';
  END IF;
END $$;

-- =============================================================================
-- 8. STORAGE BUCKET PARA AVATARS
-- =============================================================================

-- Criar bucket para avatars (se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies para avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================================================
-- 9. RESUMO FINAL
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ WK.metrics Base Tables Created Successfully';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created/verified:';
  RAISE NOTICE '  ✓ user_roles';
  RAISE NOTICE '  ✓ profiles';
  RAISE NOTICE '  ✓ positions';
  RAISE NOTICE '  ✓ squads';
  RAISE NOTICE '  ✓ professionals';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies: PERMISSIVE (authenticated users can manage)';
  RAISE NOTICE '8 default positions seeded';
  RAISE NOTICE 'Admin role assigned to denilson.nogueira@wk.com.br';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to create Squads, Users, and Professionals!';
  RAISE NOTICE '================================================';
END $$;
