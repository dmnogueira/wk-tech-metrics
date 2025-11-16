# 🚀 Aplicar Migrations no Supabase - Passo a Passo

## ❌ Problema Identificado

Você tentou executar a migration `20251116010000_fix_user_roles_and_rls.sql` mas recebeu o erro:

```
ERROR: relation "public.user_roles" does not exist
```

**Causa**: A tabela `user_roles` não existe porque a migration base que a cria (`20251103114429_ab36dbb8-a89a-4810-a5c8-04f8fa56dd90.sql`) nunca foi executada no Supabase.

---

## ✅ Solução: Migration Consolidada

Criei uma **migration consolidada** que cria TODAS as tabelas necessárias de uma vez:

**Arquivo**: `20251116020000_create_all_base_tables.sql`

### O que esta migration faz:

#### 1. ✅ Cria Todas as Tabelas Base
- `user_roles` - Roles de usuários (master, admin, gestao, usuario)
- `profiles` - Perfis de usuários
- `positions` - Cargos (Desenvolvedor, Tech Lead, etc.)
- `squads` - Times/Squads
- `professionals` - Profissionais vinculados a squads

#### 2. ✅ Configura RLS com Políticas PERMISSIVAS
- Qualquer usuário **autenticado** pode criar/editar squads
- Qualquer usuário **autenticado** pode criar/editar professionals
- Qualquer usuário **autenticado** pode criar/editar positions
- Ideal para **desenvolvimento inicial**

#### 3. ✅ Seed de Dados Iniciais
- 8 positions padrão (Desenvolvedor, Tech Lead, PO, SM, Designer, QA, DevOps, Arquiteto)
- Role 'admin' atribuído a `denilson.nogueira@wk.com.br`

#### 4. ✅ Configuração de Storage
- Bucket 'avatars' para fotos de perfil
- Políticas de acesso configuradas

---

## 📝 Passo a Passo para Aplicar

### **1️⃣ Acesse o Supabase Dashboard**

```
https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo
```

### **2️⃣ Vá para SQL Editor**

- No menu lateral esquerdo, clique em **"SQL Editor"**
- Ou acesse diretamente: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/sql/new

### **3️⃣ Crie Nova Query**

- Clique no botão **"+ New query"**

### **4️⃣ Copie o Conteúdo da Migration**

Abra o arquivo:
```
/home/user/webapp/supabase/migrations/20251116020000_create_all_base_tables.sql
```

E copie **TODO o conteúdo** (são ~350 linhas)

### **5️⃣ Cole no SQL Editor**

Cole todo o conteúdo da migration no editor SQL do Supabase

### **6️⃣ Execute a Migration**

- Clique no botão **"Run"** (canto inferior direito)
- Ou pressione **`Ctrl + Enter`** (Windows/Linux) / **`Cmd + Enter`** (Mac)

### **7️⃣ Verifique os Resultados**

Você deve ver mensagens de sucesso na parte inferior:

```
NOTICE: ================================================
NOTICE: ✅ WK.metrics Base Tables Created Successfully
NOTICE: ================================================
NOTICE: 
NOTICE: Tables created/verified:
NOTICE:   ✓ user_roles
NOTICE:   ✓ profiles
NOTICE:   ✓ positions
NOTICE:   ✓ squads
NOTICE:   ✓ professionals
NOTICE: 
NOTICE: RLS Policies: PERMISSIVE (authenticated users can manage)
NOTICE: 8 default positions seeded
NOTICE: Admin role assigned to denilson.nogueira@wk.com.br
NOTICE: 
NOTICE: 🚀 Ready to create Squads, Users, and Professionals!
NOTICE: ================================================
```

---

## 🧪 Testes Após Aplicar a Migration

### **Teste 1: Verificar Tabelas Criadas**

Execute no SQL Editor:

```sql
SELECT 
  tablename,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_roles', 'profiles', 'positions', 'squads', 'professionals')
ORDER BY tablename;
```

**Resultado esperado**: 5 tabelas listadas

---

### **Teste 2: Verificar Role do Usuário**

```sql
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'denilson.nogueira@wk.com.br';
```

**Resultado esperado**:
```
email                          | role  | created_at
-------------------------------|-------|------------------
denilson.nogueira@wk.com.br   | admin | 2024-11-16 ...
```

---

### **Teste 3: Verificar Positions Criadas**

```sql
SELECT name, description 
FROM public.positions 
ORDER BY name;
```

**Resultado esperado**: 8 positions listadas
- Analista de QA
- Arquiteto
- Desenvolvedor
- Designer
- DevOps
- Product Owner
- Scrum Master
- Tech Lead

---

### **Teste 4: Verificar RLS Policies**

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('squads', 'professionals', 'positions')
ORDER BY tablename, cmd;
```

**Resultado esperado**: Várias policies listadas com comandos SELECT, INSERT, UPDATE, DELETE

---

## 🎯 Testando no Frontend da Aplicação

### **1. Recarregar Aplicação**

- Abra o frontend: https://8081-sandbox-xxxxxxxxxx.e2b.dev
- Force um **hard refresh**: `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
- Ou clear cache do browser e recarregue

### **2. Testar Criação de Squad**

1. Navegue até a página de **Squads**
2. Clique em **"Adicionar Squad"** ou **"+ Novo Squad"**
3. Preencha os campos:
   - **Nome**: "Squad Alpha"
   - **Área**: "Tecnologia"
   - **Descrição**: "Squad de desenvolvimento frontend"
4. Clique em **"Salvar"**

**✅ Resultado esperado**: 
- Toast verde: "Squad adicionado com sucesso"
- Squad aparece na listagem
- **SEM erros** no console do browser (F12)

### **3. Testar Criação de Professional**

1. Navegue até a página de **Professionals** / **Profissionais**
2. Clique em **"Adicionar Profissional"** ou **"+ Novo"**
3. Preencha os campos:
   - **Nome**: "João Silva"
   - **Email**: "joao.silva@wk.com.br"
   - **Cargo (Position)**: Selecione "Desenvolvedor"
   - **Squad**: Selecione "Squad Alpha" (criado anteriormente)
   - **Senioridade**: "Pleno"
4. Clique em **"Salvar"**

**✅ Resultado esperado**: 
- Toast verde: "Profissional adicionado com sucesso"
- Professional aparece na listagem
- **SEM erros** no console do browser (F12)

### **4. Testar Criação de Position**

1. Navegue até a página de **Positions** / **Cargos**
2. Clique em **"Adicionar Cargo"** ou **"+ Novo"**
3. Preencha os campos:
   - **Nome**: "Analista de Dados"
   - **Descrição**: "Analista especializado em dados e BI"
4. Clique em **"Salvar"**

**✅ Resultado esperado**: 
- Toast verde: "Cargo adicionado com sucesso"
- Position aparece na listagem

---

## 🐛 Troubleshooting

### ❌ Erro: "duplicate key value violates unique constraint"

**Causa**: Você executou a migration mais de uma vez e há tentativa de inserir dados duplicados

**Solução**: 
- Isso é **normal** e **não é um problema**
- A migration usa `ON CONFLICT DO NOTHING` para evitar duplicatas
- Verifique se as tabelas foram criadas com sucesso (Teste 1)

---

### ❌ Erro: "new row violates row-level security policy"

**Causa**: As políticas RLS não foram criadas corretamente ou você não está autenticado

**Solução**:
1. Faça **logout e login novamente** no frontend
2. Verifique se o usuário está autenticado:
   ```sql
   SELECT auth.uid();
   ```
   Deve retornar um UUID (não null)
3. Verifique se as policies foram criadas (Teste 4)
4. Se persistir, execute novamente a parte de RLS da migration

---

### ❌ Erro: "permission denied for table"

**Causa**: Políticas RLS muito restritivas ou usuário não tem role adequado

**Solução**:
1. Verifique se o usuário tem role 'admin' (Teste 2)
2. Verifique se as policies PERMISSIVAS foram criadas
3. Execute esta query para ver quais policies estão ativas:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'squads';
   ```

---

### ❌ Frontend ainda mostra erro ao criar Squad

**Causa**: Cache do browser ou session antiga

**Solução**:
1. Abra **DevTools** (F12)
2. Vá para **Console**
3. Faça **hard refresh**: `Ctrl + Shift + R`
4. Ou limpe cookies/storage do site:
   - DevTools → Application → Storage → Clear site data
5. Faça **logout e login novamente**

---

## 📊 Verificação Completa de Status

Execute esta query para verificar todo o estado do sistema:

```sql
-- 1. Verificar tabelas
SELECT 'Tables' as category, tablename as name 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_roles', 'profiles', 'positions', 'squads', 'professionals')

UNION ALL

-- 2. Verificar positions
SELECT 'Positions' as category, name
FROM public.positions

UNION ALL

-- 3. Verificar user roles
SELECT 'User Roles' as category, u.email || ' - ' || ur.role as name
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id

ORDER BY category, name;
```

**Resultado esperado**:
- 5 linhas para "Tables"
- 8 linhas para "Positions"
- 1+ linhas para "User Roles" (pelo menos denilson.nogueira@wk.com.br - admin)

---

## ✅ Checklist Final

Após executar a migration, marque os itens:

- [ ] Migration executada sem erros no SQL Editor
- [ ] Mensagens de sucesso aparecem (✅ WK.metrics Base Tables Created Successfully)
- [ ] Teste 1: 5 tabelas verificadas
- [ ] Teste 2: Usuário tem role 'admin'
- [ ] Teste 3: 8 positions listadas
- [ ] Teste 4: RLS policies criadas
- [ ] Frontend recarregado com hard refresh
- [ ] Teste criação de Squad → ✅ Sucesso
- [ ] Teste criação de Professional → ✅ Sucesso
- [ ] Console do browser sem erros RLS
- [ ] Toast de sucesso aparece nas operações

---

## 📁 Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/20251116020000_create_all_base_tables.sql` | **Migration para aplicar** (12KB) |
| `ANALISE_INDICADORES_GRAFICOS.md` | Análise dos 51 indicadores (18KB) |
| `FIXING_SQUAD_USER_ERRORS.md` | Troubleshooting detalhado (8KB) |
| `RESUMO_SOLUCOES.md` | Resumo executivo (12KB) |

---

## 🎯 Próximos Passos (Após Sucesso)

1. ✅ Popular dados de exemplo:
   - Criar 3-5 squads
   - Criar 10-15 professionals
   - Associar professionals aos squads

2. 🔄 Popular valores históricos de indicadores:
   - Usar migration ou frontend para inserir indicator_values
   - Criar dados dos últimos 6 meses para visualização

3. 📊 Implementar componentes de gráficos:
   - Fase 1: 4 DORA Metrics (conforme ANALISE_INDICADORES_GRAFICOS.md)
   - Recharts + D3.js

4. 🔗 Configurar integração com Azure DevOps (futuro)

---

## 🆘 Precisa de Ajuda?

Se ainda tiver problemas após seguir este guia:

1. **Verifique o console do browser** (F12 → Console) e copie os erros
2. **Execute a query de verificação completa** (Verificação Completa de Status)
3. **Tire screenshot** do erro no SQL Editor
4. **Me informe** qual teste específico falhou

---

**📝 Nota**: Esta migration é **idempotente** (pode ser executada múltiplas vezes sem problemas). Se algo der errado, você pode simplesmente executar novamente.

**🚀 Boa sorte! A aplicação está quase pronta para uso completo!**
