# 👤 Criar Usuário no Supabase

## 🚨 Problema Identificado

Você está tentando fazer login com:
- **Email**: denilson.nogueira@wk.com.br
- **Senha**: Integdvs78!@

Mas esse usuário **NÃO EXISTE** no novo projeto Supabase ainda!

---

## ✅ Solução: Criar o Usuário no Supabase

### Método 1: Criar via Dashboard do Supabase (MAIS FÁCIL) ⚡

#### Passo 1: Acessar Authentication

1. Vá para o **Dashboard do Supabase**:
   ```
   https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo
   ```

2. No menu lateral esquerdo, clique em **"Authentication"** (ícone de pessoa/usuário)

3. Clique em **"Users"** (sub-menu)

---

#### Passo 2: Criar Novo Usuário

1. Clique no botão **"Add user"** (canto superior direito)

2. Escolha **"Create new user"**

3. Preencha os campos:
   - **Email**: `denilson.nogueira@wk.com.br`
   - **Password**: `Integdvs78!@`
   - **Auto Confirm User**: ✅ **Marque esta opção!** (para não precisar confirmar por email)

4. Clique em **"Create user"**

5. ✅ **Usuário criado com sucesso!**

---

#### Passo 3: Testar o Login

1. Volte para a aplicação:
   ```
   https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai
   ```

2. Faça login:
   - **Email**: denilson.nogueira@wk.com.br
   - **Senha**: Integdvs78!@

3. 🎉 **Deve funcionar agora!**

---

### Método 2: Criar via SQL (ALTERNATIVA)

Se preferir criar via SQL:

#### Passo 1: Abrir SQL Editor

```
https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/editor
```

#### Passo 2: Executar SQL

Clique em **"+ New query"** e cole este código:

```sql
-- Criar usuário (a senha será "Integdvs78!@")
-- Nota: O Supabase usa bcrypt para hash de senha
-- Você precisa gerar o hash da senha antes

-- Alternativa mais simples: Use o Dashboard (Método 1)
-- Ou use a função de signup da aplicação
```

**⚠️ ATENÇÃO**: Criar usuário via SQL é mais complexo porque precisa gerar o hash bcrypt da senha. **Use o Método 1 (Dashboard)!**

---

### Método 3: Criar via Página de Registro da Aplicação

Se a aplicação tiver uma página de registro:

1. Procure por link "Criar conta" ou "Sign up" na página de login

2. Preencha o formulário de registro

3. Confirme o email (ou use "Auto Confirm" no Supabase)

**⚠️ NOTA**: Verifique se a aplicação tem página de registro implementada.

---

## 🔍 Verificar Se Usuário Foi Criado

### Via Dashboard

1. Vá em **Authentication → Users**
2. Você deve ver o email `denilson.nogueira@wk.com.br` na lista
3. Status deve estar como **"Confirmed"**

---

## 🎯 Configurar Permissões de Administrador (OPCIONAL)

Se você quiser que este usuário seja **administrador** com todas as permissões:

### Passo 1: Pegar o UUID do Usuário

1. No **Authentication → Users**, clique no email do usuário
2. **Copie o UUID** (ID do usuário - algo como `abc123-def456-...`)

### Passo 2: Inserir Role no Banco

1. Abra o **SQL Editor**:
   ```
   https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/editor
   ```

2. Clique em **"+ New query"**

3. Cole este SQL (substitua `SEU_UUID_AQUI` pelo UUID copiado):

```sql
-- Criar tabela user_roles se não existir
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('master', 'admin', 'gestao', 'usuario')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Inserir role de administrador para o usuário
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_UUID_AQUI', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

4. Clique em **"Run"** (▶️)

5. ✅ **Usuário agora é administrador!**

---

## 📋 Resumo do Passo a Passo

**Para fazer login na aplicação**:

1. ✅ **Criar usuário no Supabase** (Authentication → Users → Add user)
   - Email: denilson.nogueira@wk.com.br
   - Senha: Integdvs78!@
   - ✅ Marcar "Auto Confirm User"

2. ✅ **Testar login na aplicação**
   - Acessar: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai
   - Fazer login com email e senha

3. ✅ **(Opcional) Tornar administrador**
   - Pegar UUID do usuário
   - Executar SQL para inserir role 'admin'

---

## ❓ Problemas Comuns

### "Email not confirmed"
**Solução**: 
- Vá em Authentication → Users
- Clique no usuário
- Clique em "Send confirmation email" OU marque como confirmado manualmente

### "Invalid login credentials"
**Solução**:
- Verifique se o usuário foi criado corretamente
- Confirme que a senha está correta
- Tente resetar a senha no dashboard

### "User already exists"
**Solução**:
- O usuário já foi criado
- Use "Reset password" se esqueceu a senha
- Ou delete e recrie o usuário

---

## 🔗 Links Importantes

- **Supabase Authentication**: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/auth/users
- **SQL Editor**: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/editor
- **Aplicação**: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai

---

## 📞 Próximo Passo

**Agora você precisa**:

1. ✅ Ir em Authentication → Users → Add user
2. ✅ Criar o usuário com email e senha
3. ✅ Marcar "Auto Confirm User"
4. ✅ Fazer login na aplicação

**Depois de criar o usuário, me avise!**

✅ **"Criei o usuário e consegui fazer login!"**

OU se houver problemas:

❌ **"Deu erro ao criar: [descreva o erro]"**

---

**Boa sorte! 🚀**
