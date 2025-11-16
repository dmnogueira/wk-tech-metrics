# 🔍 Como Localizar seu Projeto Supabase

## Informações do Projeto
- **Project ID**: `kszbfbqzattjtpywlqfz`
- **URL do Projeto**: https://kszbfbqzattjtpywlqfz.supabase.co
- **Dashboard URL**: https://supabase.com/dashboard/project/kszbfbqzattjtpywlqfz

---

## 📋 Passo a Passo para Encontrar o Projeto

### Método 1: Acesso Direto pela URL (MAIS RÁPIDO) ⚡

1. **Abra esta URL diretamente no navegador**:
   ```
   https://supabase.com/dashboard/project/kszbfbqzattjtpywlqfz
   ```

2. **O que pode acontecer**:
   - ✅ **Sucesso**: Você verá o dashboard do projeto
   - 🔐 **Login necessário**: Faça login com a conta que criou o projeto
   - ❌ **Erro 404**: O projeto não existe ou você não tem acesso (veja soluções abaixo)

---

### Método 2: Buscar no Dashboard do Supabase

#### Passo 1: Acessar o Supabase
1. Abra seu navegador
2. Vá para: https://supabase.com/dashboard
3. **Faça login** com sua conta

#### Passo 2: Verificar Lista de Projetos
1. Após o login, você verá uma **lista de todos os seus projetos**
2. Procure por:
   - **Nome**: Pode estar como "wk-tech-metrics", "kpi-insight" ou similar
   - **Project ID**: `kszbfbqzattjtpywlqfz`
   - **Region**: Veja qual região foi criada (ex: South America, US East, etc)

#### Passo 3: Verificar Organização
Se você **não vê o projeto na lista**:

1. **Clique no seletor de organização** (canto superior esquerdo do dashboard)
2. **Troque para outras organizações** que você tem acesso
3. Verifique se o projeto aparece em outra organização

---

### Método 3: Verificar Acesso via API

Você pode testar se o projeto existe e se suas credenciais funcionam:

1. **Abra o console do navegador** (F12)
2. **Cole este código JavaScript**:
   ```javascript
   fetch('https://kszbfbqzattjtpywlqfz.supabase.co/rest/v1/', {
     headers: {
       'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzemn...',
       'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzemn...'
     }
   })
   .then(r => r.json())
   .then(d => console.log('✅ Projeto existe e credenciais funcionam!', d))
   .catch(e => console.error('❌ Erro ao acessar projeto:', e))
   ```

**Resultado esperado**:
- ✅ Se mostrar "✅ Projeto existe" → Suas credenciais estão corretas
- ❌ Se mostrar erro → Pode haver problema de acesso

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: "Não vejo o projeto na lista"

**Possíveis causas**:

1. **Você está logado com a conta errada**
   - Solução: Verifique se está na conta correta do Supabase
   - Tente fazer logout e login novamente

2. **O projeto está em outra organização**
   - Solução: Clique no seletor de organização e verifique outras orgs

3. **Você não é o dono do projeto**
   - Solução: Peça ao dono do projeto para te adicionar como colaborador
   - Vá em: Project Settings → Team → Adicionar seu email

4. **O projeto foi deletado**
   - Solução: Veja "Criar Novo Projeto" abaixo

---

### Problema 2: "Erro 404 ao acessar URL"

**Solução**: O projeto pode não existir mais. Você tem duas opções:

#### Opção A: Criar Novo Projeto no Supabase

1. Vá para https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `wk-tech-metrics`
   - **Database Password**: Anote bem esta senha!
   - **Region**: Escolha a mais próxima (ex: South America)
4. Clique em **"Create new project"**
5. **Aguarde 2-3 minutos** para o projeto ser provisionado

#### Opção B: Atualizar Credenciais no .env

Depois de criar o novo projeto:

1. No dashboard do Supabase, vá em: **Settings → API**
2. Copie as informações:
   - **Project URL**: Ex: `https://abcdefgh.supabase.co`
   - **Project ID**: Ex: `abcdefgh` (parte da URL)
   - **anon/public key**: A chave que começa com `eyJ...`

3. Atualize o arquivo `.env` no projeto:
   ```bash
   VITE_SUPABASE_PROJECT_ID="seu-novo-id"
   VITE_SUPABASE_URL="https://seu-novo-id.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="sua-nova-chave-eyJ..."
   ```

4. **Reinicie o servidor**:
   ```bash
   # Pare o servidor atual (Ctrl+C)
   # Depois rode novamente:
   npm run dev
   ```

---

### Problema 3: "Tenho acesso mas o SQL Editor está vazio"

**Isso é normal!** O SQL Editor não mostra automaticamente os arquivos de migration.

**Solução**: Execute as migrations manualmente (veja próxima seção)

---

## ✅ Depois de Encontrar o Projeto

Quando você **conseguir acessar o projeto**, siga estas etapas:

### 1. Executar Migration 1 (Criar Tabelas)

1. No dashboard do Supabase, vá em: **SQL Editor** (menu lateral esquerdo)
2. Clique em: **"New query"**
3. **Abra o arquivo** `supabase/migrations/20251115000000_create_indicators_system.sql`
4. **Copie TODO o conteúdo** do arquivo
5. **Cole no SQL Editor** do Supabase
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. **Aguarde** a execução (deve levar alguns segundos)
8. ✅ Você verá: "Success. No rows returned"

### 2. Executar Migration 2 (Inserir Indicadores)

1. Ainda no **SQL Editor**, clique em **"New query"** novamente
2. **Abra o arquivo** `supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql`
3. **Copie TODO o conteúdo** do arquivo (são 1.950 linhas!)
4. **Cole no SQL Editor** do Supabase
5. Clique em **"Run"** (ou pressione Ctrl+Enter)
6. **Aguarde** a execução (pode levar 10-30 segundos)
7. ✅ Você verá: "Success. X rows returned" (com detalhes dos indicadores inseridos)

### 3. Verificar se Funcionou

1. **Recarregue a aplicação** no navegador
2. A página de **"Indicadores Técnicos"** deve mostrar os **51 indicadores**
3. Você pode filtrar por categoria, ordenar, buscar, etc.

---

## 📞 Precisa de Mais Ajuda?

Se ainda assim não conseguir encontrar o projeto, me avise:

1. **Qual erro específico você está vendo?**
   - Screenshot ajuda muito!

2. **Você consegue acessar https://supabase.com/dashboard ?**
   - Sim ou não?

3. **Quantos projetos você vê na lista?**
   - Zero, um, vários?

4. **Prefere criar um novo projeto?**
   - Posso te guiar nesse processo

---

## 🎯 Resumo Rápido

```bash
# 1. Tente acessar diretamente:
https://supabase.com/dashboard/project/kszbfbqzattjtpywlqfz

# 2. Se não funcionar, vá para:
https://supabase.com/dashboard
# E procure o projeto na lista

# 3. Se não achar, crie novo projeto e atualize .env

# 4. Depois execute as migrations no SQL Editor

# 5. Recarregue a aplicação e veja os indicadores! 🎉
```

---

## 📚 Arquivos de Referência

- `.env` - Credenciais atuais do Supabase
- `supabase/migrations/20251115000000_create_indicators_system.sql` - Criação das tabelas
- `supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql` - Dados dos indicadores
- `SETUP_DATABASE.md` - Guia completo de configuração do banco

Boa sorte! 🚀
