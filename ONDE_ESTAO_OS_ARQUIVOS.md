# 📁 Onde Estão os Arquivos das Migrations

## ✅ Os Arquivos Existem!

Os arquivos estão na pasta `supabase/migrations/` do projeto.

---

## 📍 Localização Exata

### Caminho Completo no Servidor:
```
/home/user/webapp/supabase/migrations/
```

### Arquivos que Você Precisa:

#### 1️⃣ Migration 1 (Criar Tabelas)
```
20251115000000_create_indicators_system.sql
```
- **Tamanho**: 8.1 KB
- **Linhas**: ~240 linhas
- **O que faz**: Cria as 5 tabelas do sistema

#### 2️⃣ Migration 2 (Inserir Indicadores)
```
20251116000000_seed_indicators_from_spreadsheet.sql
```
- **Tamanho**: 46 KB
- **Linhas**: ~1.365 linhas
- **O que faz**: Insere os 51 indicadores da planilha

---

## 🔍 Como Encontrar no Seu Computador

### Se Você Clonou o Repositório:

1. **Abra a pasta do projeto** onde você clonou
2. **Navegue para**: `supabase` → `migrations`
3. **Você verá os arquivos**:
   - `20251115000000_create_indicators_system.sql`
   - `20251116000000_seed_indicators_from_spreadsheet.sql`

---

## 💡 3 Formas de Acessar os Arquivos

### Opção 1: Abrir Diretamente do GitHub ✨ (MAIS FÁCIL!)

**Migration 1** (Criar Tabelas):
```
https://raw.githubusercontent.com/dmnogueira/wk-tech-metrics/main/supabase/migrations/20251115000000_create_indicators_system.sql
```

**Migration 2** (Inserir Indicadores):
```
https://raw.githubusercontent.com/dmnogueira/wk-tech-metrics/main/supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql
```

**Como usar**:
1. Clique no link acima
2. Você verá o código SQL no navegador
3. Selecione TUDO (Ctrl+A)
4. Copie (Ctrl+C)
5. Cole no SQL Editor do Supabase (Ctrl+V)
6. Execute!

---

### Opção 2: Clonar o Repositório

Se você ainda não clonou:

```bash
git clone https://github.com/dmnogueira/wk-tech-metrics.git
cd wk-tech-metrics/supabase/migrations
```

Depois abra os arquivos em qualquer editor de texto.

---

### Opção 3: Download Direto

1. Vá para: https://github.com/dmnogueira/wk-tech-metrics
2. Navegue para: `supabase` → `migrations`
3. Clique em cada arquivo
4. Clique em "Raw" (botão no canto superior direito)
5. Salve o arquivo (Ctrl+S)

---

## 🚀 Método MAIS RÁPIDO (Recomendado)

### Use os Links Diretos do GitHub!

Não precisa baixar nada! Siga este passo a passo:

#### PASSO 1: Abrir Supabase SQL Editor
```
https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/editor
```

#### PASSO 2: Executar Migration 1

1. No SQL Editor, clique em **"+ New query"**

2. **Abra este link** em outra aba:
   ```
   https://raw.githubusercontent.com/dmnogueira/wk-tech-metrics/main/supabase/migrations/20251115000000_create_indicators_system.sql
   ```

3. **Você verá o código SQL** no navegador

4. **Selecione TUDO** (Ctrl+A)

5. **Copie** (Ctrl+C)

6. **Volte para o SQL Editor** do Supabase

7. **Cole** o código (Ctrl+V)

8. **Clique em "Run"** (▶️)

9. ✅ Aguarde: "Success. No rows returned"

#### PASSO 3: Executar Migration 2

1. No SQL Editor, clique em **"+ New query"** novamente

2. **Abra este link** em outra aba:
   ```
   https://raw.githubusercontent.com/dmnogueira/wk-tech-metrics/main/supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql
   ```

3. **Selecione TUDO** (Ctrl+A)

4. **Copie** (Ctrl+C)

5. **Volte para o SQL Editor**

6. **Cole** o código (Ctrl+V)

7. **Clique em "Run"** (▶️)

8. ✅ Aguarde 10-30 segundos: "Success"

---

## 🎯 Resultado Final

Depois de executar as duas migrations:

1. **Recarregue a aplicação**:
   ```
   https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai
   ```

2. **Vá em "Indicadores Técnicos"**

3. 🎉 **Você verá 51 indicadores!**

---

## ❓ Ainda com Dúvidas?

### "Não consigo abrir os links do GitHub"
- Tente copiar e colar o link completo no navegador
- Ou vá direto no repositório: https://github.com/dmnogueira/wk-tech-metrics

### "O código é muito grande"
- É normal! A Migration 2 tem ~1.365 linhas
- O Supabase aguenta tranquilamente
- Aguarde 10-30 segundos para executar

### "Deu erro ao executar"
- Me envie o erro exato que apareceu
- Cole a mensagem de erro completa

---

## 📞 Próximo Passo

**Use o Método Mais Rápido** (links diretos do GitHub):

1. ✅ Abra o SQL Editor do Supabase
2. ✅ Abra o link da Migration 1
3. ✅ Copie tudo e cole no SQL Editor
4. ✅ Execute (Run)
5. ✅ Repita para Migration 2
6. 🎉 Pronto!

---

## 🔗 Links Importantes

- **SQL Editor**: https://supabase.com/dashboard/project/drgbectxonuivwxnmxlo/editor
- **Migration 1 (GitHub)**: https://raw.githubusercontent.com/dmnogueira/wk-tech-metrics/main/supabase/migrations/20251115000000_create_indicators_system.sql
- **Migration 2 (GitHub)**: https://raw.githubusercontent.com/dmnogueira/wk-tech-metrics/main/supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql
- **Aplicação**: https://8080-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai

---

Boa sorte! Estou aqui para ajudar! 🚀
