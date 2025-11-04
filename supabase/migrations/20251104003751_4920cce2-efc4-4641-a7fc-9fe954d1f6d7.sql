-- Remove a foreign key constraint que está causando o erro
-- Esta constraint impede a criação de profiles sem um usuário auth correspondente
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Comentário explicativo
COMMENT ON TABLE public.profiles IS 'Tabela de perfis de usuários e profissionais. Pode conter registros sem usuário de autenticação associado.';