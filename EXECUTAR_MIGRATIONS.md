# 🗄️ Executar Migrations no Supabase

## ✅ Status Atual

- ✅ Projeto Supabase criado: **wk-tech-metrics**
- ✅ Credenciais configuradas no `.env`
- ✅ Servidor reiniciado com novas credenciais
- ✅ Aplicação acessível: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai
- ⏳ **FALTAM**: Executar as migrations para criar o banco de dados

---

## 🎯 Agora Você Precisa Executar as Migrations

As migrations vão:
1. **Criar as tabelas** no banco de dados (5 tabelas)
2. **Inserir os 51 indicadores** técnicos da planilha Excel

---

## 📋 Passo a Passo Detalhado

### ETAPA 1: Acessar o SQL Editor do Supabase

1. **Abra o Supabase** no navegador: https://supabase.com/dashboard
2. **Clique no projeto** "wk-tech-metrics" (ou acesse diretamente: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo)
3. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone de </>)

---

### ETAPA 2: Executar Migration 1 (Criar Tabelas)

#### A. Abrir Nova Query

1. No SQL Editor, clique no botão **"+ New query"** (canto superior direito)
2. Uma aba em branco será aberta

#### B. Copiar o Código SQL

1. **Abra o arquivo** `supabase/migrations/20251115000000_create_indicators_system.sql` no seu computador
   - Caminho completo: `/home/user/webapp/supabase/migrations/20251115000000_create_indicators_system.sql`
   
2. **Selecione TODO o conteúdo** do arquivo (Ctrl+A)

3. **Copie** (Ctrl+C)

#### C. Executar no Supabase

1. **Cole o código** no SQL Editor do Supabase (Ctrl+V)

2. **Clique em "Run"** (botão ▶️ no canto superior direito) ou pressione `Ctrl+Enter`

3. ⏳ **Aguarde** alguns segundos

4. ✅ **Resultado esperado**:
   ```
   Success. No rows returned
   ```

5. 🎉 **Pronto!** As tabelas foram criadas:
   - `indicators` - Tabela principal de indicadores
   - `indicator_values` - Valores históricos dos indicadores
   - `data_sources` - Fontes de dados (Azure DevOps, etc)
   - `indicator_data_mappings` - Mapeamentos de dados
   - `import_batches` - Lotes de importação

---

### ETAPA 3: Executar Migration 2 (Inserir Indicadores)

#### A. Abrir Nova Query

1. Ainda no SQL Editor, clique em **"+ New query"** novamente
2. Uma nova aba em branco será aberta

#### B. Copiar o Código SQL

1. **Abra o arquivo** `supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql`
   - Caminho completo: `/home/user/webapp/supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql`
   
2. **Selecione TODO o conteúdo** (Ctrl+A)
   - ⚠️ **ATENÇÃO**: São 1.950 linhas! Certifique-se de copiar tudo!

3. **Copie** (Ctrl+C)

#### C. Executar no Supabase

1. **Cole o código** no SQL Editor (Ctrl+V)

2. **Clique em "Run"** (▶️) ou pressione `Ctrl+Enter`

3. ⏳ **Aguarde 10-30 segundos** (é um arquivo grande!)

4. ✅ **Resultado esperado**:
   ```
   Success
   
   [Você verá uma lista com informações dos 51 indicadores inseridos]
   ```

5. 🎉 **Pronto!** Os 51 indicadores foram inseridos no banco!

---

### ETAPA 4: Verificar se Funcionou

#### A. Recarregar a Aplicação

1. **Abra a aplicação** no navegador: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai

2. **Recarregue a página** (F5 ou Ctrl+R)

#### B. Verificar os Indicadores

1. Clique em **"Indicadores Técnicos"** no menu

2. ✅ **Você deve ver**:
   - **51 indicadores** listados na tabela
   - Categorias no dropdown: DORA, Quality, Planning, etc.
   - Busca funcionando
   - Ordenação funcionando
   - Detalhes de cada indicador

3. 🎊 **SUCESSO!** A aplicação está 100% funcional!

---

## 📊 O Que Foi Criado

### Tabelas Criadas (Migration 1)

| Tabela | Descrição | Colunas Principais |
|--------|-----------|-------------------|
| `indicators` | Indicadores técnicos | name, acronym, category, formula, targets |
| `indicator_values` | Valores históricos | indicator_id, value, date, team |
| `data_sources` | Fontes de dados | name, type, connection_config |
| `indicator_data_mappings` | Mapeamentos | indicator_id, data_source_id, query |
| `import_batches` | Lotes de importação | status, processed_at, metadata |

### Indicadores Inseridos (Migration 2)

- **Total**: 51 indicadores
- **Categorias**: 31 diferentes
- **Principais**:
  - 🚀 DORA Metrics (Deployment Frequency, Lead Time, etc)
  - 🐛 Quality Metrics (Code Coverage, Bug Rate, etc)
  - 📊 Planning Metrics (Sprint Velocity, Story Points, etc)
  - 🔧 Technical Metrics (Tech Debt, Code Complexity, etc)

---

## 🔍 Como Verificar no Supabase

### Ver as Tabelas Criadas

1. No Supabase, vá em **"Table Editor"** (menu lateral)
2. Você verá as 5 tabelas listadas
3. Clique em `indicators` para ver os dados

### Ver os Indicadores Inseridos

1. Na tabela `indicators`, você verá as 51 linhas
2. Cada linha é um indicador com todas as informações:
   - Nome completo
   - Acrônimo
   - Categoria
   - Fórmula de cálculo
   - Queries do Azure DevOps
   - Targets (meta ideal, aceitável, crítico)

---

## ❌ Solução de Problemas

### Erro: "relation already exists"

**Causa**: As tabelas já foram criadas antes.

**Solução**: 
1. Pule a Migration 1
2. Execute apenas a Migration 2

**OU**

1. Delete as tabelas existentes:
   - Vá em Table Editor
   - Para cada tabela, clique nos 3 pontinhos → Delete
2. Execute a Migration 1 novamente

---

### Erro: "duplicate key value violates unique constraint"

**Causa**: Os indicadores já foram inseridos antes.

**Solução**: Está tudo certo! Os dados já estão no banco.

---

### Erro ao colar código no SQL Editor

**Causa**: Arquivo muito grande.

**Solução**:
1. Copie apenas metade do arquivo
2. Execute
3. Copie a outra metade
4. Execute novamente

**OU**

Use a linha de comando (me avise que eu te ajudo).

---

## 🎯 Checklist Final

Antes de me avisar que terminou, verifique:

- ✅ Executei Migration 1 (criar tabelas)
- ✅ Vi "Success. No rows returned"
- ✅ Executei Migration 2 (inserir indicadores)
- ✅ Vi "Success" com lista de indicadores
- ✅ Recarreguei a aplicação no navegador
- ✅ Vejo 51 indicadores na página "Indicadores Técnicos"
- ✅ Consigo filtrar, buscar e ordenar os indicadores

---

## 📞 Depois de Executar

**Me avise quando terminar!** Diga:
- ✅ "Executei as duas migrations com sucesso!"
- ✅ "Vejo os 51 indicadores na aplicação!"

**OU se houver problemas**:
- ❌ "Deu erro na migration 1: [copie o erro]"
- ❌ "Deu erro na migration 2: [copie o erro]"
- ❌ "Executei mas não vejo os indicadores"

---

## 🚀 URLs Importantes

- **Aplicação**: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai
- **Supabase Dashboard**: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo
- **GitHub Repo**: https://github.com/dmnogueira/wk-tech-metrics

---

## 📚 Arquivos das Migrations

No seu computador, os arquivos estão em:
```
/home/user/webapp/supabase/migrations/
├── 20251115000000_create_indicators_system.sql (Migration 1)
└── 20251116000000_seed_indicators_from_spreadsheet.sql (Migration 2)
```

Boa sorte! 🎉 Estou aqui para ajudar se precisar!
