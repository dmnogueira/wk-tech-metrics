# 🔍 Verificar Se as Migrations Foram Executadas

## 📋 Passo a Passo para Verificar

### 1️⃣ Verificar Se as Tabelas Existem

Vamos ver se as 5 tabelas foram criadas:

#### Abrir SQL Editor:
```
https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/editor
```

#### Executar Esta Query:

Clique em **"+ New query"** e cole:

```sql
-- Verificar quais tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Clique em **"Run"** ▶️

#### ✅ Resultado Esperado:

Você deve ver estas tabelas:
- `data_sources`
- `import_batches`
- `indicator_data_mappings`
- `indicator_values`
- `indicators`

---

### 2️⃣ Verificar Se os Indicadores Foram Inseridos

#### Executar Esta Query:

```sql
-- Contar indicadores
SELECT COUNT(*) as total_indicadores FROM public.indicators;

-- Ver os primeiros 10 indicadores
SELECT id, name, acronym, category 
FROM public.indicators 
ORDER BY priority DESC 
LIMIT 10;
```

Clique em **"Run"** ▶️

#### ✅ Resultado Esperado:

- **total_indicadores**: 51
- **Lista com 10 indicadores** (Lead Time, Cycle Time, etc)

---

### 3️⃣ Se NÃO Vê as Tabelas

#### Opção A: Executar as Migrations Novamente

As migrations têm `CREATE TABLE IF NOT EXISTS`, então é seguro executar novamente.

**Migration 1** (criar tabelas):
```
https://raw.githubusercontent.com/dmnogueira/wk-tech-metrics/main/supabase/migrations/20251115000001_create_indicators_system_fixed.sql
```

**Migration 2** (inserir indicadores):
```
https://raw.githubusercontent.com/dmnogueira/wk-tech-metrics/main/supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql
```

---

#### Opção B: Verificar Se Você Executou no Projeto Correto

1. Abra Authentication → Users:
   ```
   https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/auth/users
   ```

2. **Verifique se você vê o usuário** `denilson.nogueira@wk.com.br`

3. **Se NÃO VÊ o usuário**:
   - Você está no projeto errado!
   - Volte para: https://supabase.com/dashboard
   - Procure o projeto correto: `wk-tech-metrics`
   - Entre nele e execute as migrations lá

---

### 4️⃣ Fazer Login e Testar

Depois de confirmar que as tabelas existem:

1. **Limpar cache do navegador**:
   - Pressione `Ctrl+Shift+Delete`
   - Ou `Ctrl+F5` para forçar reload

2. **Abrir a aplicação**:
   ```
   https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai
   ```

3. **Fazer login**:
   - Email: denilson.nogueira@wk.com.br
   - Senha: Integdvs78!@

4. **Abrir o Console do Navegador** (F12):
   - Aba "Console"
   - Procure por erros em vermelho

5. **Verificar se vê o dashboard**

---

### 5️⃣ Ir Direto para Indicadores

Se o dashboard não carregar, tente acessar **diretamente a página de indicadores**:

```
https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai/indicadores
```

Você deve ver uma tabela com os 51 indicadores!

---

## 🐛 Erros que Pode Ignorar

Estes erros são NORMAIS e NÃO impedem o funcionamento:

```
❌ Could not find the table 'public.dashboard_data'
❌ Could not find the function public.get_dashboard_data
```

**Por quê?**: A aplicação tenta buscar dados de uma tabela que não existe mais (legado do projeto antigo). Mas isso NÃO afeta os indicadores!

---

## ✅ O Que Deve Funcionar

Após executar as migrations corretamente:

### Página de Indicadores (`/indicadores`):
- ✅ Tabela com 51 indicadores
- ✅ Busca por nome/acrônimo
- ✅ Filtro por categoria
- ✅ Ordenação
- ✅ Detalhes expandíveis

### Dashboard Principal (`/`):
- ⚠️ Pode mostrar "Nenhum indicador ativo" se não houver VALORES cadastrados
- ⚠️ Pode ter erros sobre `dashboard_data` (IGNORAR)
- ✅ Menu lateral funcionando
- ✅ Navegação entre páginas

---

## 📊 O Dashboard Está Vazio?

**É NORMAL!** O dashboard precisa de:
1. ✅ Indicadores (você tem 51)
2. ❌ **VALORES** dos indicadores (você NÃO tem ainda!)

Para ter dados no dashboard, você precisa:
- Importar valores via página "Importação de Dados"
- Ou inserir valores manualmente no banco

---

## 🎯 Teste Rápido

Execute estas 3 queries no SQL Editor para confirmar tudo:

```sql
-- 1. Ver quantas tabelas existem
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Esperado: >= 5

-- 2. Ver quantos indicadores existem
SELECT COUNT(*) FROM public.indicators;
-- Esperado: 51

-- 3. Ver os primeiros indicadores
SELECT name, acronym, category FROM public.indicators LIMIT 5;
-- Esperado: Lista com Lead Time, Cycle Time, etc
```

---

## 📞 Me Envie Os Resultados

Depois de verificar, me diga:

✅ **"As 5 tabelas existem e tenho 51 indicadores!"**
   - Então vamos para próximo passo: acessar /indicadores

❌ **"Não vejo as tabelas"**
   - Me diga quantas tabelas aparecem

❌ **"Tenho as tabelas mas 0 indicadores"**
   - Precisa executar a Migration 2 novamente

❌ **"Estou no projeto errado"**
   - Vamos te guiar para o projeto correto

---

## 🔗 Links Importantes

- **SQL Editor**: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/editor
- **Authentication**: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/auth/users
- **Table Editor**: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/editor
- **Página Indicadores**: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai/indicadores
- **Dashboard**: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai

---

**Execute as queries de verificação e me envie os resultados!** 🔍
