-- Adicionar novos campos à tabela professionals
ALTER TABLE public.professionals
ADD COLUMN profile_type text DEFAULT 'colaborador' CHECK (profile_type IN ('gestao', 'especialista', 'colaborador', 'master', 'admin')),
ADD COLUMN manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN managed_squads text[] DEFAULT '{}';

-- Criar índices para melhor performance
CREATE INDEX idx_professionals_profile_type ON public.professionals(profile_type);
CREATE INDEX idx_professionals_manager_id ON public.professionals(manager_id);

-- Comentários
COMMENT ON COLUMN public.professionals.profile_type IS 'Tipo de perfil do profissional: gestao, especialista, colaborador, master ou admin';
COMMENT ON COLUMN public.professionals.manager_id IS 'ID do perfil do gerente/liderança imediata';
COMMENT ON COLUMN public.professionals.managed_squads IS 'Array com nomes dos squads gerenciados (para perfil gestão)';