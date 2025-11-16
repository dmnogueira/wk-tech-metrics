# 🔧 Configurar Projeto "KPIs" do Supabase

## 📋 Situação Atual

✅ **Você tem um projeto chamado "KPIs" ativo no Supabase**  
❌ **O projeto `kszbfbqzattjtpywlqfz` do .env não existe**

**Solução**: Vamos configurar o projeto "KPIs" para funcionar com esta aplicação!

---

## 🚀 Passo a Passo - Configuração Completa

### Etapa 1: Acessar o Projeto "KPIs"

1. **Clique no card "KPIs"** na sua dashboard do Supabase
2. Você será levado para o dashboard do projeto
3. **Anote mentalmente** que este é o projeto que vamos usar

---

### Etapa 2: Copiar as Credenciais do Projeto

1. No projeto "KPIs", clique em **"Settings"** (⚙️ ícone de engrenagem no menu lateral)
2. Clique em **"API"** na seção de configurações
3. Você verá uma tela com várias informações

#### 📝 Copie Estas 3 Informações:

**A. Project URL**
- Procure por: **"Project URL"** ou **"URL"**
- Formato: `https://xxxxxxxxxx.supabase.co`
- **Copie este valor completo**

**B. Project ID**
- É a primeira parte da URL
- Exemplo: Se a URL é `https://abcdefgh.supabase.co`, o ID é `abcdefgh`
- **Anote este valor**

**C. anon / public Key**
- Procure por: **"Project API keys"** → **"anon public"**
- É uma chave longa que começa com `eyJ...`
- **Copie esta chave completa** (pode ser bem longa!)

---

### Etapa 3: Atualizar o Arquivo .env

Agora vamos atualizar as credenciais no projeto:

**Cole estes valores aqui e me envie**:
```
Project URL: [cole aqui]
Project ID: [cole aqui]
anon/public key: [cole aqui]
```

Depois que você me enviar, eu atualizo o arquivo `.env` automaticamente!

---

### Etapa 4: Executar as Migrations (Criar Banco de Dados)

Depois de atualizar o `.env`, você precisa criar as tabelas no banco de dados:

#### Migration 1: Criar Tabelas

1. No projeto "KPIs", vá em **"SQL Editor"** (menu lateral esquerdo)
2. Clique em **"+ New query"**
3. **Abra o arquivo** `supabase/migrations/20251115000000_create_indicators_system.sql` no seu computador
4. **Copie TODO o conteúdo** (é um arquivo grande!)
5. **Cole no SQL Editor** do Supabase
6. Clique no botão **"Run"** (▶️) ou pressione `Ctrl+Enter`
7. ⏳ **Aguarde** alguns segundos
8. ✅ Você deve ver: **"Success. No rows returned"**

#### Migration 2: Inserir os 51 Indicadores

1. Ainda no **"SQL Editor"**, clique em **"+ New query"** novamente
2. **Abra o arquivo** `supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql`
3. **Copie TODO o conteúdo** (são 1.950 linhas!)
4. **Cole no SQL Editor** do Supabase
5. Clique no botão **"Run"** (▶️) ou pressione `Ctrl+Enter`
6. ⏳ **Aguarde** 10-30 segundos (é um arquivo grande!)
7. ✅ Você deve ver: **"Success"** com informações sobre os indicadores inseridos

---

### Etapa 5: Reiniciar o Servidor

Depois de atualizar o `.env`, você precisa reiniciar o servidor:

**Eu farei isso automaticamente quando você me enviar as credenciais!**

---

### Etapa 6: Verificar se Funcionou! 🎉

1. **Recarregue a aplicação** no navegador
2. Vá na página **"Indicadores Técnicos"**
3. ✅ Você deve ver **51 indicadores** organizados por categoria!
4. 🎊 **Sucesso!** A aplicação está funcionando!

---

## 📸 Onde Encontrar Cada Informação

### Settings → API

Você verá uma tela parecida com esta:

```
Configuration
├── Project URL: https://xxxxxxxxxx.supabase.co ← COPIE ISTO
├── API URL: https://xxxxxxxxxx.supabase.co/rest/v1
└── GraphQL URL: ...

Project API keys
├── anon public: eyJhbGciOiJIUzI1NiIsInR... ← COPIE ISTO
└── service_role: eyJhbGciOiJIUzI1NiIsInR... ← NÃO USE ESTA!
```

**⚠️ IMPORTANTE**: 
- Use a chave **"anon public"** (não a "service_role")
- A chave "anon public" é segura para usar no frontend
- A chave "service_role" é secreta e não deve ser exposta

---

## 🎯 Resumo do Que Você Precisa Fazer AGORA

1. ✅ **Abrir o projeto "KPIs"** no Supabase
2. ✅ **Ir em Settings → API**
3. ✅ **Copiar as 3 informações**:
   - Project URL
   - Project ID (parte da URL)
   - anon/public key
4. ✅ **Me enviar** essas informações
5. ⏳ **Eu atualizo o .env e reinicio o servidor**
6. ✅ **Você executa as 2 migrations** no SQL Editor
7. 🎉 **Aplicação funcionando!**

---

## ❓ Dúvidas Comuns

**P: Posso usar o projeto "app-modernizer-hub" ao invés do "KPIs"?**  
R: Sim! Mas ele está pausado. Você precisaria reativá-lo primeiro. É mais fácil usar o "KPIs" que já está ativo.

**P: Por que o projeto `kszbfbqzattjtpywlqfz` não existe?**  
R: Provavelmente foi criado em outra conta ou foi deletado. Não tem problema, vamos usar o "KPIs"!

**P: Vou perder dados do projeto "KPIs"?**  
R: Não se ele estiver vazio! As migrations criam tabelas novas. Se já houver tabelas com os mesmos nomes, a migration pode dar erro (mas não apaga nada).

**P: Posso criar um projeto novo só para esta aplicação?**  
R: Sim! Basta clicar em "+ New project", criar com o nome "wk-tech-metrics", e me enviar as credenciais dele.

---

## 📞 Próximo Passo

**Por favor, me envie as 3 informações do projeto "KPIs"**:

```
Project URL: 
Project ID: 
anon/public key: 
```

Assim que você enviar, eu:
1. ✅ Atualizo o arquivo `.env`
2. ✅ Reinicio o servidor automaticamente
3. ✅ Te guio na execução das migrations
4. 🎉 Aplicação funcionando!

Estou aguardando! 🚀
