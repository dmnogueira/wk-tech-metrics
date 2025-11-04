-- Remove a constraint de foreign key do manager_id que está causando erro
-- Isso permite que profissionais possam ser salvos sem precisar que o manager_id seja um profile_id válido
ALTER TABLE public.professionals DROP CONSTRAINT IF EXISTS professionals_manager_id_fkey;

-- Adiciona comentário explicativo
COMMENT ON COLUMN public.professionals.manager_id IS 'ID do profissional que é gestor/líder. Não requer constraint FK para permitir flexibilidade na gestão.';