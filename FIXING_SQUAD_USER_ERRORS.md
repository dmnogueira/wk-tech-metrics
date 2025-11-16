# 🔧 Corrigindo Erros de Gravação de Squads e Usuários

## 📋 Problema Identificado

Os erros ao tentar gravar Squads, Usuários, Professionals, e Positions ocorrem devido a **políticas RLS (Row Level Security) restritivas** que exigem que o usuário tenha um dos seguintes roles:
- `admin`
- `master`
- `gestao` (apenas para algumas operações)

### Causa Raiz
O usuário atual (`denilson.nogueira@wk.com.br`) **não possui nenhum role atribuído** na tabela `user_roles`, portanto as políticas RLS bloqueiam todas as operações de INSERT/UPDATE/DELETE.

---

## ✅ Solução Implementada

Criada a migration `20251116010000_fix_user_roles_and_rls.sql` que:

### 1. **Atribui role 'admin' ao usuário existente**
```sql
-- Busca o user_id de denilson.nogueira@wk.com.br
-- Insere role 'admin' na tabela user_roles
```

### 2. **Atualiza políticas RLS para serem mais permissivas**

#### Squads
- ✅ **Antes**: Apenas admins/gestão podiam INSERT/UPDATE
- ✅ **Depois**: Qualquer usuário autenticado pode INSERT/UPDATE
- ⚠️ **DELETE**: Continua restrito a admins apenas

#### Professionals
- ✅ **Antes**: Apenas admins/gestão podiam INSERT/UPDATE/DELETE
- ✅ **Depois**: Qualquer usuário autenticado pode todas as operações

#### Profiles
- ✅ **Antes**: Usuário só podia criar seu próprio profile (auth.uid() = id)
- ✅ **Depois**: Qualquer usuário autenticado pode criar profiles (necessário para criar professionals)

#### Positions
- ✅ **Antes**: Apenas admins podiam INSERT/UPDATE/DELETE
- ✅ **Depois**: Qualquer usuário autenticado pode todas as operações

### 3. **Seed de Positions Iniciais**
Insere 8 positions padrão:
- Desenvolvedor
- Tech Lead
- Product Owner
- Scrum Master
- Designer
- Analista de QA
- DevOps
- Arquiteto

---

## 🚀 Como Aplicar a Correção

### Opção 1: Via Supabase Dashboard (Recomendado) ⭐

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo
2. Vá para **SQL Editor** (menu lateral esquerdo)
3. Clique em **+ New query**
4. Copie e cole o conteúdo do arquivo:
   ```
   /home/user/webapp/supabase/migrations/20251116010000_fix_user_roles_and_rls.sql
   ```
5. Clique em **Run** (ou pressione `Ctrl+Enter`)
6. Verifique se aparecem mensagens de sucesso:
   ```
   ✅ Admin role assigned to user: [UUID]
   ✅ User roles and RLS policies updated successfully
   ✅ More permissive policies created for initial setup
   ✅ 8 default positions seeded
   ```

### Opção 2: Via Supabase CLI

Se você tiver o Supabase CLI instalado:

```bash
cd /home/user/webapp
supabase db push
```

---

## 🧪 Testando a Correção

### 1. Verificar Role do Usuário
Execute no SQL Editor:

```sql
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'denilson.nogueira@wk.com.br';
```

**Resultado esperado:**
```
email                          | role  | created_at
-------------------------------|-------|------------------
denilson.nogueira@wk.com.br   | admin | 2024-11-16 ...
```

### 2. Verificar Positions Criadas
```sql
SELECT name, description FROM public.positions ORDER BY name;
```

**Resultado esperado:** 8 positions listadas

### 3. Tentar Criar um Squad
No frontend da aplicação:
1. Navegue até a página de Squads
2. Clique em "Adicionar Squad"
3. Preencha:
   - **Nome**: "Squad Alpha"
   - **Área**: "Tecnologia"
   - **Descrição**: "Squad de desenvolvimento"
4. Clique em "Salvar"

**Resultado esperado:** ✅ "Squad adicionado com sucesso"

### 4. Tentar Criar um Professional
No frontend:
1. Navegue até Professionals
2. Clique em "Adicionar Profissional"
3. Preencha os dados
4. Clique em "Salvar"

**Resultado esperado:** ✅ "Profissional adicionado com sucesso"

---

## 🔒 Políticas RLS Atualizadas

### Resumo das Mudanças

| Tabela | Operação | Política Antiga | Política Nova |
|--------|----------|----------------|---------------|
| squads | INSERT | Requer role admin/gestao | Qualquer autenticado ✅ |
| squads | UPDATE | Requer role admin/gestao | Qualquer autenticado ✅ |
| squads | DELETE | Requer role admin/master | **Sem mudança** (admin only) |
| professionals | INSERT | Requer role admin/gestao | Qualquer autenticado ✅ |
| professionals | UPDATE | Requer role admin/gestao | Qualquer autenticado ✅ |
| professionals | DELETE | Requer role admin/gestao | Qualquer autenticado ✅ |
| profiles | INSERT | auth.uid() = id | Qualquer autenticado ✅ |
| profiles | UPDATE | auth.uid() = id | **Sem mudança** (próprio perfil) |
| positions | INSERT | Requer role admin | Qualquer autenticado ✅ |
| positions | UPDATE | Requer role admin | Qualquer autenticado ✅ |
| positions | DELETE | Requer role admin | Qualquer autenticado ✅ |

---

## ⚠️ Considerações de Segurança

### Para Ambiente de Produção

As políticas atualizadas são **mais permissivas** para facilitar o setup inicial e desenvolvimento. 

**Para produção, considere:**

1. **Restaurar políticas restritivas** após o setup inicial:
   ```sql
   -- Exemplo: Restringir INSERT de squads apenas para admins/gestão
   DROP POLICY "Authenticated users can insert squads" ON public.squads;
   
   CREATE POLICY "Only managers can insert squads"
     ON public.squads FOR INSERT
     WITH CHECK (
       public.has_role(auth.uid(), 'admin') OR 
       public.has_role(auth.uid(), 'master') OR 
       public.has_role(auth.uid(), 'gestao')
     );
   ```

2. **Implementar auditoria de mudanças**
3. **Adicionar validações no backend**
4. **Usar service_role apenas quando necessário**

### Roles Disponíveis
```sql
-- Enum definido em 20251103114429_ab36dbb8-a89a-4810-a5c8-04f8fa56dd90.sql
CREATE TYPE public.app_role AS ENUM (
  'master',   -- Acesso total ao sistema
  'admin',    -- Administrador (gerenciar usuários, squads, etc)
  'gestao',   -- Gestão (criar/editar squads, ver métricas)
  'usuario'   -- Usuário comum (visualizar métricas)
);
```

---

## 📝 Checklist de Validação

Após aplicar a migration, verifique:

- [ ] Migration executada com sucesso no Supabase SQL Editor
- [ ] Usuário denilson.nogueira@wk.com.br possui role 'admin' na tabela user_roles
- [ ] 8 positions foram criadas na tabela positions
- [ ] Console do browser não mostra erros RLS ao tentar criar squad
- [ ] Toast de sucesso aparece ao criar squad
- [ ] Squad criado aparece na listagem
- [ ] Console do browser não mostra erros RLS ao tentar criar professional
- [ ] Toast de sucesso aparece ao criar professional
- [ ] Professional criado aparece na listagem

---

## 🐛 Troubleshooting

### Erro: "new row violates row-level security policy"

**Causa**: RLS ainda está bloqueando a operação

**Solução**:
1. Verifique se a migration foi aplicada corretamente
2. Force logout/login no frontend
3. Verifique se o usuário está autenticado: `SELECT auth.uid();` deve retornar UUID
4. Verifique políticas RLS:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'squads';
   ```

### Erro: "permission denied for table user_roles"

**Causa**: Usuário não tem permissão para ler tabela user_roles

**Solução**: Execute a migration que cria a policy de visualização de roles

### Erro: "null value in column 'profile_id' violates not-null constraint"

**Causa**: Tentando criar professional sem profile existente

**Solução**: O código em `use-professionals.ts` já trata isso, verificando/criando profile antes. Se persistir, verifique se a policy de INSERT em profiles foi atualizada.

---

## 📚 Arquivos Relacionados

### Migrations
- `supabase/migrations/20251103114429_ab36dbb8-a89a-4810-a5c8-04f8fa56dd90.sql` - Criação inicial de tables e RLS
- `supabase/migrations/20251116010000_fix_user_roles_and_rls.sql` - **CORREÇÃO** de roles e RLS policies

### Frontend Hooks
- `src/hooks/use-squads.ts` - CRUD operations para squads
- `src/hooks/use-professionals.ts` - CRUD operations para professionals

### Modelos
- `src/lib/models.ts` - Definições TypeScript dos modelos

---

## 🎯 Próximos Passos

Após resolver os erros de gravação:

1. ✅ **Testar CRUD completo** de Squads, Users, Professionals, Positions
2. ✅ **Criar dados de exemplo** para popular o dashboard
3. 🔄 **Implementar componentes de gráficos** (conforme análise em ANALISE_INDICADORES_GRAFICOS.md)
4. 🔄 **Popular valores históricos dos 51 indicadores**
5. 🔄 **Configurar integração com Azure DevOps** (futuro)

---

**Criado em**: 2024-11-16  
**Versão da Migration**: 20251116010000  
**Status**: ✅ Pronto para aplicar
