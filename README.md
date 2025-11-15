# WK.metrics

**Sistema de Gestão e Visualização de Indicadores Técnicos**

Sistema web para gestão, definição e visualização de indicadores técnicos para as squads de tecnologia da WK. A plataforma centraliza métricas de qualidade, fluxo, DevOps (DORA), SRE e planejamento, alinhadas aos objetivos estratégicos.

🎯 **Diferencial**: Dashboard dinâmico que se adapta aos indicadores configurados, não requer código para adicionar novas métricas.

## 📋 Características Principais

- ✅ **Dashboard Dinâmico**: Renderiza automaticamente baseado em indicadores ativos
- ✅ **Gestão de Indicadores**: CRUD completo com formulário detalhado (50 campos configuráveis)
- ✅ **Importação de Dados**: Manual, CSV em lote, ou automação via API (planejado)
- ✅ **Identidade Visual WK**: Cores, tipografia e estética clean da marca
- ✅ **Segurança**: RLS (Row Level Security) e autenticação robusta
- ✅ **Categorização**: Agrupamento automático por categorias
- ✅ **Status Visual**: Crítico (vermelho), Atenção (amarelo), Excelente (azul)
- ✅ **KRs Destacados**: Badge especial para Key Results

## 🏗️ Arquitetura

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth (JWT)
- **State**: React Query + Context API

### Estrutura do Banco de Dados
- `indicators` - Biblioteca de métricas (15 exemplos pré-carregados)
- `indicator_values` - Valores históricos por período/squad
- `data_sources` - Fontes de dados para automação
- `indicator_data_mappings` - Mapeamento indicador-fonte
- `import_batches` - Rastreabilidade de importações

## 📊 Módulos Implementados

### 1. Dashboard Dinâmico (`/`)
Visualização de métricas com renderização automática baseada em indicadores ativos e categorias.

### 2. Gestão de Indicadores (`/indicadores`)
CRUD completo para configurar a biblioteca de métricas:
- Informações básicas (nome, sigla, categoria, prioridade)
- Descrições e documentação (objetivo, fórmula, ações)
- Integração (Azure DevOps, queries WIQL/OData)

### 3. Gestão de Dados (`/importacao`)
Três formas de alimentar dados:
- **Input Manual**: Formulário para valores individuais
- **Importação em Lote**: Upload de CSV com validação
- **Conexões de Dados**: Automação via APIs (roadmap)

### 4. Gestão Organizacional (mantido)
- Squads, Profissionais, Cargos
- Organograma hierárquico

### 5. Administração
- Usuários e permissões
- Configurações do sistema

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ e npm
- Conta no Supabase (opcional, para produção)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/dmnogueira/wk-tech-metrics.git
cd wk-tech-metrics

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 4. Rode as migrations (se necessário)
# npx supabase db push

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📖 Documentação Adicional

- **[VALIDATION.md](./VALIDATION.md)**: Checklist de conformidade com PRD v2.0
- **[IMPLEMENTACAO_RESUMO.md](./IMPLEMENTACAO_RESUMO.md)**: Resumo executivo da implementação
- **[PRD Original](./docs/PRD.md)**: Product Requirements Document completo

## Project info

**Repository**: https://github.com/dmnogueira/wk-tech-metrics

**Original Project URL**: https://lovable.dev/projects/94999def-572c-4ae7-8e36-e0a06ad8bd1b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/94999def-572c-4ae7-8e36-e0a06ad8bd1b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/dmnogueira/wk-tech-metrics.git

# Step 2: Navigate to the project directory.
cd wk-tech-metrics

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🎨 Identidade Visual WK

O sistema segue rigorosamente a identidade visual da WK:

### Cores
- **Primárias**: Roxo WK (#3c2d55), Laranja WK (#e6503c), Branco/Cinza Claro
- **Secundárias**: Azul (#3c7dc8), Lavanda (#b4b4e1), Amarelo (#f5c85a), Salmão (#ffa587)

### Tipografia
- **Work Sans**: Títulos e corpo de texto
- **Bree Serif**: Logo WK.metrics

### Estética
- Clean e minimalista ("Menos é mais")
- Sem sombras, gradientes ou relevos
- Tom de voz: simples, confiante, educativo

## 🛠️ Tecnologias Utilizadas

**Frontend**:
- React 18.3 + TypeScript 5.8
- Vite 5.4 (build tool)
- Tailwind CSS 3.4 + shadcn/ui
- React Router 6.30
- React Query (TanStack Query) 5.83
- Recharts 2.15 (gráficos)
- React Hook Form 7.61 (formulários)
- date-fns 3.6 (datas)

**Backend & Infraestrutura**:
- Supabase (PostgreSQL + Auth + Edge Functions)
- Row Level Security (RLS)
- Edge Functions para lógica serverless

**Dev Tools**:
- ESLint 9.32
- TypeScript ESLint 8.38
- Lovable (AI development platform)

## 📈 Indicadores Pré-configurados

O sistema vem com 15 indicadores de exemplo em 5 categorias:

### Fluxo/Entrega
- Lead Time, Cycle Time, Throughput

### Qualidade
- Bugs Críticos, Taxa de Retenção de Bugs, Code Coverage

### DevOps/DORA
- Deployment Frequency, Change Failure Rate, MTTR

### Planejamento
- Backlog Refinado, Velocidade (Story Points)

### SRE & Disponibilidade
- Uptime, Número de Incidentes, Iniciativas Técnicas

## 🔄 Roadmap

### Fase 2 - Expansão (2-3 meses)
- ✅ Gráficos de histórico de 6 meses
- ✅ Interface de configuração de conexões completa
- ✅ Suporte a Excel na importação
- ✅ Expansão para 50 indicadores

### Fase 3 - Automação (3-6 meses)
- ⏳ Workers de sincronização com Azure DevOps
- ⏳ Integração com SonarQube
- ⏳ Agendamento de jobs (cron)
- ⏳ Logs detalhados de sincronização

### Fase 4 - Análise Avançada (6-12 meses)
- ⏳ Alertas automáticos por threshold
- ⏳ Relatórios exportáveis (PDF/Excel)
- ⏳ Dashboards personalizados
- ⏳ Machine Learning para predições

## 🤝 Contribuindo

Este é um projeto interno da WK. Para contribuir:

1. Crie uma branch a partir de `main`
2. Faça suas alterações
3. Commit seguindo [Conventional Commits](https://www.conventionalcommits.org/)
4. Abra um Pull Request

## 📄 Licença

Propriedade de WK Sistemas - Uso Interno

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato com a equipe de TI da WK.

---

**Desenvolvido com atenção aos detalhes da identidade WK**  
**Data de Implementação**: 15/11/2025  
**Versão**: 1.0.0
