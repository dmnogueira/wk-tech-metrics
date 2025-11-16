# 🗄️ Guia de Configuração do Banco de Dados

## ⚠️ IMPORTANTE: Migrations Não Executadas

O banco de dados Supabase ainda **não possui as tabelas necessárias** para o WK.metrics funcionar.

**Por isso o dashboard está vazio!**

---

## 🚀 Como Executar as Migrations

### **Passo 1: Acessar o Supabase**

1. Acesse: **https://supabase.com/dashboard**
2. Faça login com suas credenciais
3. Selecione o projeto: **`kszbfbqzattjtpywlqfz`**

### **Passo 2: Abrir o SQL Editor**

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"** (Nova consulta)

### **Passo 3: Executar Migration 1 - Estrutura de Tabelas**

1. Abra o arquivo: `supabase/migrations/20251115000000_create_indicators_system.sql`
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **"Run"** (Executar) no canto inferior direito
5. ✅ Aguarde a mensagem de sucesso

**Esta migration cria:**
- ✅ Tabela `indicators`
- ✅ Tabela `indicator_values`
- ✅ Tabela `data_sources`
- ✅ Tabela `indicator_data_mappings`
- ✅ Tabela `import_batches`
- ✅ Políticas de segurança (RLS)
- ✅ Índices de performance

### **Passo 4: Executar Migration 2 - Dados dos 51 Indicadores**

1. Clique em **"New Query"** novamente
2. Abra o arquivo: `supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql`
3. **Copie TODO o conteúdo** (são 1.950 linhas)
4. **Cole no SQL Editor**
5. Clique em **"Run"** (Executar)
6. ✅ Aguarde a confirmação (pode demorar alguns segundos)

**Esta migration insere:**
- ✅ 51 indicadores técnicos
- ✅ Com todas as fórmulas e metas
- ✅ Consultas do Azure DevOps
- ✅ Organizados por 31 categorias

---

## ✅ Verificar se Funcionou

Após executar as migrations, **recarregue a página** do WK.metrics:

1. Acesse: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai
2. Faça login
3. Vá para **"Gestão de Indicadores"** (`/indicadores`)
4. **Você deve ver os 51 indicadores listados!**
5. Volte ao Dashboard (`/`) - as seções aparecerão

---

## 🔍 Diagnóstico de Problemas

### **Problema: "Could not find table 'indicators'"**

**Solução:** Execute a Migration 1 (estrutura das tabelas)

### **Problema: "Dashboard vazio ou seções desaparecem"**

**Causas possíveis:**
1. ❌ Migrations não executadas → Execute os passos acima
2. ❌ Nenhum indicador ativo → Vá em `/indicadores` e ative alguns
3. ❌ Erro de CSS bloqueando render → Já corrigido no código

### **Problema: "Erro de permissão ao executar migration"**

**Solução:** 
- Verifique se você é admin/owner do projeto Supabase
- Use a conta que criou o projeto

---

## 📊 O que Acontece Após as Migrations

### **No Dashboard (`/`)**
- ✅ Seções aparecerão automaticamente por categoria
- ✅ Exemplos: "Fluxo/Entrega", "DevOps/DORA", "Qualidade", etc.
- ✅ Widgets de indicadores (ainda sem dados)

### **Em Indicadores (`/indicadores`)**
- ✅ Listagem dos 51 indicadores
- ✅ Busca e filtros funcionando
- ✅ Edição e ativação/desativação

### **Em Importação (`/importacao`)**
- ✅ Formulário de input manual
- ✅ Upload de CSV
- ✅ Template para download

---

## 🎯 Próximo Passo: Adicionar Dados

Depois que as migrations estiverem rodando, você pode:

### **Opção 1: Input Manual**
1. Vá em `/importacao`
2. Aba "Input Manual"
3. Selecione um indicador (ex: Lead Time)
4. Escolha o período e squad
5. Insira um valor de teste
6. Salve

### **Opção 2: Importação em Lote**
1. Vá em `/importacao`
2. Aba "Importação em Lote"
3. Baixe o template CSV
4. Preencha com dados
5. Faça upload

---

## 🆘 Se Precisar de Ajuda

1. Verifique o console do navegador (F12)
2. Confira a aba "Network" para erros de API
3. No Supabase, vá em "Table Editor" para ver as tabelas criadas
4. No Supabase, vá em "Logs" para ver erros de query

---

## 📝 Resumo Rápido

```bash
# 1. Acesse Supabase Dashboard
https://supabase.com/dashboard

# 2. Projeto
kszbfbqzattjtpywlqfz

# 3. SQL Editor > New Query

# 4. Execute (nesta ordem):
#    - supabase/migrations/20251115000000_create_indicators_system.sql
#    - supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql

# 5. Recarregue a aplicação
https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai
```

---

**Após executar as migrations, o sistema estará 100% funcional!** 🎉
