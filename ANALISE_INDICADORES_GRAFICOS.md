# 📊 Análise Profunda dos 51 Indicadores Técnicos - Necessidades de Gráficos

**Data**: 16/11/2024  
**Total de Indicadores**: 51  
**Categorias**: 31 categorias únicas

---

## 🎯 RESUMO EXECUTIVO

Dos 51 indicadores, identificamos **3 níveis de prioridade** para visualização:

- **🔴 CRÍTICOS (20 indicadores)**: Requerem gráficos de linha temporal + comparação
- **🟡 IMPORTANTES (18 indicadores)**: Requerem gráficos simples + tendência
- **🟢 INFORMATIVOS (13 indicadores)**: Cards com número + sparkline

---

## 🔴 INDICADORES CRÍTICOS - Gráficos Completos Necessários

### 1. Lead Time (LT) - **DORA KEY METRIC**
**Categoria**: Fluxo/Entrega  
**Granularidade**: Sprint e Mensal

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: Mediana do Lead Time
2. **Box plot**: Distribuição (Mediana, P50, P85, P95)
3. **Comparação YoY**: Mês atual vs mesmo mês ano anterior
4. **Por Squad**: Gráfico de barras comparativo
5. **Por Tipo de Item**: Feature vs Bug vs Task

**Motivo**: É um dos 4 DORA metrics mais importantes. Decisões estratégicas dependem dele.

---

### 2. Cycle Time (CT) - **DORA KEY METRIC**
**Categoria**: Fluxo/Entrega  
**Granularidade**: Sprint

**Gráficos Necessários**:
1. **Linha temporal (Sprint)**: Mediana do Cycle Time
2. **Histogram**: Distribuição de tempos
3. **Por Squad**: Comparação entre squads
4. **Scatter plot**: Tamanho do item vs Cycle Time (detectar outliers)
5. **Control Chart**: Limites de controle (P50, P85)

**Motivo**: Fluxo eficiente é core do Lean/Agile. Time precisa ver tendências.

---

### 3. Frequência de Deploy (DF) - **DORA KEY METRIC**
**Categoria**: DevOps/DORA  
**Granularidade**: Semanal e Mensal

**Gráficos Necessários**:
1. **Linha temporal (Semanal)**: Deploys por semana
2. **Heat map**: Deploys por dia da semana/hora
3. **Por Serviço**: Barras comparativas
4. **Cumulative Flow**: Total acumulado no mês
5. **Target line**: Linha de meta (diário = 7 deploys/semana)

**Motivo**: Deployment frequency é KEY DORA metric. Elite performers = múltiplos/dia.

---

### 4. Taxa de Falha de Mudança (CFR) - **DORA KEY METRIC**
**Categoria**: DevOps/DORA  
**Granularidade**: Mensal

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: % de falhas
2. **Stacked bar**: Deploys com sucesso vs falhas
3. **Por Serviço**: Heatmap de severidade
4. **Pareto**: Serviços que mais geram rollbacks
5. **Correlation**: CFR vs Tamanho de PR (investigar correlação)

**Motivo**: Estabilidade é crucial. Alta CFR = dor operacional.

---

### 5. Tempo Médio de Recuperação (MTTR) - **DORA KEY METRIC**
**Categoria**: DevOps/DORA  
**Granularidade**: Mensal e por incidente

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: MTTR médio
2. **Por Severidade**: P1 vs P2 vs P3
3. **Distribution**: Histogram de tempos de recuperação
4. **Run chart**: MTTR por incidente (linha sequencial)
5. **Target zones**: Zonas verdes (<60min P1), amarelas, vermelhas

**Motivo**: Downtime custa caro. Liderança quer ver melhoria contínua.

---

### 6. Throughput (TP) - **Forecasting Essential**
**Categoria**: Fluxo  
**Granularidade**: Sprint

**Gráficos Necessários**:
1. **Linha temporal (Sprint)**: Itens concluídos por sprint
2. **Control chart**: Com limites de controle estatístico
3. **Por Tipo**: Stacked bar (Feature/Bug/Task)
4. **Monte Carlo**: Simulação de forecast (quantos itens em N sprints)
5. **Velocity trend**: Linha de tendência (rolling average)

**Motivo**: Base para previsibilidade. Time precisa saber capacidade.

---

### 7. Confiabilidade de Compromisso (CR%)
**Categoria**: Planejamento  
**Granularidade**: Sprint

**Gráficos Necessários**:
1. **Linha temporal (Sprint)**: % de compromisso cumprido
2. **Por Squad**: Barras comparativas
3. **Target line**: 85% de meta
4. **Scatter plot**: Comprometido vs Concluído (cada sprint = ponto)
5. **Trend**: Linha de tendência (melhorando/piorando?)

**Motivo**: Confiança dos stakeholders depende disso.

---

### 8. Eficiência de Fluxo (FE%)
**Categoria**: Fluxo/Lean  
**Granularidade**: Mensal

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: % de eficiência
2. **Waterfall**: Tempo ativo vs tempo de espera (por etapa)
3. **Por Squad**: Comparação
4. **Heatmap**: Eficiência por coluna Kanban
5. **Target zones**: <40% (vermelho), 40-60% (amarelo), >60% (verde)

**Motivo**: Identifica gargalos e filas. Lean essencial.

---

### 9. Taxa de Defeitos Escapados (DER)
**Categoria**: Qualidade  
**Granularidade**: Mensal

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: % de bugs em produção
2. **Por Produto**: Barras comparativas
3. **Funnel**: Bugs encontrados (Dev → QA → Staging → Prod)
4. **Trend**: Linha de tendência
5. **Cost impact**: Se possível, correlacionar com custo de suporte

**Motivo**: Bugs em produção = reputação + custo. Alta prioridade executiva.

---

### 10. Densidade de Defeitos (DD)
**Categoria**: Qualidade  
**Granularidade**: Mensal

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: Bugs por 100 itens
2. **Por Módulo**: Heatmap (módulos mais problemáticos)
3. **Scatter plot**: Volume de entrega vs Densidade
4. **Pareto**: 80% dos bugs vêm de 20% dos módulos?
5. **Normalized trend**: Densidade normalizada (remover efeito de volume)

**Motivo**: Qualidade proporcional ao volume. Foca refatoração.

---

### 11. Tempo de Review de PR (CRT)
**Categoria**: Qualidade/Fluxo  
**Granularidade**: Semanal

**Gráficos Necessários**:
1. **Linha temporal (Semanal)**: Mediana de tempo de review
2. **Distribution**: Histogram (detectar outliers)
3. **Por Revisor**: Quem está mais rápido/lento?
4. **Por Repo**: Alguns repos têm review mais lento?
5. **Scatter plot**: Tamanho de PR vs Tempo de Review

**Motivo**: Filas de PR travam fluxo. Devs querem feedback rápido.

---

### 12. Tamanho de PR (PRS)
**Categoria**: Qualidade  
**Granularidade**: Semanal

**Gráficos Necessários**:
1. **Linha temporal (Semanal)**: Mediana de linhas alteradas
2. **Distribution**: Histogram
3. **Por Repo**: Alguns repos têm PRs gigantes?
4. **Scatter plot**: Tamanho de PR vs Taxa de Rejeição
5. **Target zones**: <300 (verde), 300-800 (amarelo), >800 (vermelho)

**Motivo**: PRs grandes = reviews ruins = bugs. Treinar time.

---

### 13. Taxa de Sucesso de Build (BSR)
**Categoria**: CI/CD  
**Granularidade**: Semanal

**Gráficos Necessários**:
1. **Linha temporal (Semanal)**: % de sucesso
2. **Por Pipeline**: Barras comparativas
3. **Root cause**: Stacked bar (falhas de teste vs infra vs outros)
4. **Trend**: Linha de tendência
5. **Target line**: 95% mínimo

**Motivo**: Builds quebrados = tempo perdido. Pipeline precisa ser estável.

---

### 14. Duração do Pipeline (PD)
**Categoria**: CI/CD  
**Granularidade**: Semanal

**Gráficos Necessários**:
1. **Linha temporal (Semanal)**: Mediana de duração
2. **Por Pipeline**: Barras comparativas
3. **Breakdown**: Stacked bar (tempo de build + test + deploy)
4. **Distribution**: Histogram
5. **Target line**: 10min CI, 20min CD

**Motivo**: Feedback lento = produtividade baixa. Otimizar pipelines.

---

### 15. Cobertura de Testes (TCOV%)
**Categoria**: Qualidade/Testes  
**Granularidade**: Mensal

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: % de cobertura
2. **Por Serviço**: Barras comparativas
3. **Heatmap**: Cobertura por módulo
4. **Scatter plot**: Cobertura vs Densidade de Defeitos (inversamente proporcional?)
5. **Target line**: 60% mínimo

**Motivo**: Cobertura baixa = risco. Quality gate depende disso.

---

### 16. Índice de Dívida Técnica (TDR)
**Categoria**: Qualidade/Código  
**Granularidade**: Mensal

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: Índice de dívida
2. **Por Serviço**: Barras comparativas (focar nos piores)
3. **Breakdown**: Stacked bar (Code smells, Vulnerabilities, Bugs, Duplications)
4. **Trend**: Linha de tendência (melhorando?)
5. **Cost**: Esforço de remediação em dias

**Motivo**: Dívida técnica acumula = manutenção cara. Liderança quer controle.

---

### 17. Taxa de Testes Instáveis (FTR)
**Categoria**: Qualidade/Testes  
**Granularidade**: Mensal

**Gráficos Necessários**:
1. **Linha temporal (Mensal)**: % de testes flaky
2. **Por Suite**: Quais suites têm mais flaky?
3. **Pareto**: 80% dos flaky estão em 20% dos testes?
4. **Impact**: Stacked bar (tempo perdido com flaky)
5. **Target line**: <1%

**Motivo**: Flaky tests = falsos negativos = desconfiança. Matar com fogo.

---

### 18. Lead Time de Mudanças (MLTC)
**Categoria**: DevOps/DORA+  
**Granularidade**: Semanal

**Gráficos Necessários**:
1. **Linha temporal (Semanal)**: Commit → Prod
2. **Por Serviço**: Barras comparativas
3. **Breakdown**: Stacked bar (Commit→Build→Test→Deploy)
4. **Distribution**: Histogram
5. **Target line**: <1 dia

**Motivo**: Aceleração de pipeline end-to-end. DORA elite = horas.

---

### 19. Idade de Bugs Abertos (BA)
**Categoria**: Qualidade/Suporte  
**Granularidade**: Semanal

**Gráficos Necessários**:
1. **Linha temporal (Semanal)**: Mediana de idade
2. **Por Severidade**: P1 vs P2 vs P3
3. **Distribution**: Histogram (quantos bugs >30 dias?)
4. **Heatmap**: Idade por produto/módulo
5. **Target zones**: <7 dias (P50), <21 dias (P90)

**Motivo**: Bugs antigos = desmotivação + débito. Precisa visibilidade.

---

### 20. WIP por Desenvolvedor (WIP/Dev)
**Categoria**: Fluxo/Capacidade  
**Granularidade**: Semanal

**Gráficos Necessários**:
1. **Linha temporal (Semanal)**: WIP/Dev médio
2. **Por Squad**: Barras comparativas
3. **Por Profissional**: Identificar quem está sobrecarregado
4. **Distribution**: Histogram
5. **Target line**: ≤1.5 (ideal ~1)

**Motivo**: Multitarefa mata produtividade. Precisa controle visual.

---

## 🟡 INDICADORES IMPORTANTES - Gráficos Simples

### 21-38: Segunda Prioridade
Estes indicadores precisam de:
- **Linha temporal básica** (tendência)
- **Comparação por Squad/Produto** (barras)
- **Card com número principal** + **mini sparkline**

Exemplos:
- Taxa de Reabertura de Itens (RR)
- Mix de Severidade de Bugs (SMix)
- Cobertura de Review (RCOV%)
- Code Churn (CHURN%)
- Taxa de Retrabalho (REWORK%)
- Variação de Escopo (SC%)
- Taxa de Itens Prontos (RRR)
- Conformidade DoR (DoR%)
- Acurácia de Estimativa (EA%)
- Utilização de Capacidade (CU%)
- Fator de Foco (FF)
- Índice de Troca de Contexto (CSI)
- Taxa de Hotfix (HFR)
- Cumprimento de SLA (SLA%)
- Taxa de Bugs por Cliente (CFBR)
- Tempo até Triagem (TTT)
- Tempo da Primeira Resposta (TFR)
- Entrega Líquida de Funcionalidades (NFD)

---

## 🟢 INDICADORES INFORMATIVOS - Cards + Sparkline

### 39-51: Terceira Prioridade
Estes indicadores precisam apenas de:
- **Card grande** com número principal
- **Mini sparkline** (últimos 30 dias)
- **Indicador de tendência** (↑ bom/ruim, ↓ bom/ruim, → neutro)

Exemplos:
- Taxa de Correção de Bugs (BFR)
- Tempo PR→Deploy (PR2DEP)
- Distribuição de Origem de Defeitos (DEF-ORIG)
- Tempo em Review/QA (TREV)
- Aging de WIP (AGING-WIP)
- Taxa de Carregamento (CARRY%)
- Utilização Individual (UTIL/h)
- Carga de Fluxo (FLOW/WIP)
- Adoção de IA (AI)
- Proporção Discovery/Delivery (DDR)
- Saúde do Backlog (BH)
- Índice de Qualidade de Especificação (SQI)
- Lead Time de Análise (DRLT)

---

## 📊 TIPOS DE GRÁFICOS NECESSÁRIOS

### 1. **Line Chart** (Temporal)
**Uso**: Maioria dos indicadores  
**Biblioteca**: Recharts `<LineChart>`  
**Features**:
- Múltiplas séries (comparação de squads)
- Linhas de meta (target)
- Zonas coloridas (verde/amarelo/vermelho)
- Tooltip interativo

---

### 2. **Box Plot** (Distribuição)
**Uso**: Lead Time, Cycle Time, PR Review Time  
**Biblioteca**: Recharts custom ou D3.js  
**Features**:
- Mediana, quartis, outliers
- Comparação lado a lado (por squad)

---

### 3. **Histogram** (Frequência)
**Uso**: Distribuições de tempo, tamanhos  
**Biblioteca**: Recharts `<BarChart>` com binning  
**Features**:
- Bins automáticos
- Overlay de curva normal (opcional)

---

### 4. **Heatmap** (Matriz)
**Uso**: Deploy frequency (dia/hora), Eficiência por coluna  
**Biblioteca**: Recharts custom ou react-calendar-heatmap  
**Features**:
- Escala de cores (verde→vermelho)
- Tooltip com valores

---

### 5. **Stacked Bar** (Composição)
**Uso**: Throughput por tipo, Breakdown de defeitos  
**Biblioteca**: Recharts `<BarChart>` stacked  
**Features**:
- Legendas claras
- Total no topo

---

### 6. **Scatter Plot** (Correlação)
**Uso**: Tamanho de PR vs Review Time, Cobertura vs Defeitos  
**Biblioteca**: Recharts `<ScatterChart>`  
**Features**:
- Linha de regressão (opcional)
- Quadrantes (bom/ruim)

---

### 7. **Pareto Chart** (80/20)
**Uso**: Módulos com mais bugs, Serviços com mais falhas  
**Biblioteca**: Recharts `<ComposedChart>` (barras + linha)  
**Features**:
- Barras de frequência
- Linha cumulativa
- 80% highlight

---

### 8. **Control Chart** (Controle Estatístico)
**Uso**: Throughput, Cycle Time (detectar anomalias)  
**Biblioteca**: Recharts `<LineChart>` com bandas  
**Features**:
- Linha central (média)
- Limites de controle (±3σ)
- Pontos fora de controle destacados

---

### 9. **Sparkline** (Mini tendência)
**Uso**: Cards de indicadores informativos  
**Biblioteca**: Recharts tiny ou react-sparklines  
**Features**:
- Sem eixos (minimalista)
- Apenas tendência visual
- Cor indica bom/ruim

---

### 10. **Cumulative Flow Diagram** (CFD)
**Uso**: WIP por coluna Kanban  
**Biblioteca**: Recharts `<AreaChart>` stacked  
**Features**:
- Áreas empilhadas por estado
- Detectar gargalos (largura de banda)

---

## 🎨 RECOMENDAÇÕES DE UI/UX

### Dashboard Principal
```
┌─────────────────────────────────────────────────────┐
│ 📊 WK.metrics - Dashboard Executivo                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Filtros: Mês] [Squad] [Produto]                   │
│                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│ │ Lead Time│ │Cycle Time│ │Deploy Frq│ │   CFR   ││
│ │  5.2 d   │ │  3.1 d   │ │   12/sem │ │  8.5%   ││
│ │  ↓ -15%  │ │  ↑ +10%  │ │  ↑ +20%  │ │  ↓ -5%  ││
│ │ [sparkl] │ │ [sparkl] │ │ [sparkl] │ │[sparkl] ││
│ └──────────┘ └──────────┘ └──────────┘ └─────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 📈 Lead Time Trend (Últimos 6 meses)           ││
│ │ [LINE CHART com meta e zonas]                  ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │ 📊 Por Squad     │ │ 📊 Distribuição         │ │
│ │ [BAR CHART]      │ │ [BOX PLOT]              │ │
│ └──────────────────┘ └──────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Página de Indicador Individual
- **Header**: Nome, descrição, meta
- **KPI Card**: Valor atual grande + tendência
- **Linha temporal**: Histórico completo
- **Breakdowns**: Por squad, produto, tipo
- **Insights**: Alertas automáticos ("Squad X está 2σ acima da média")
- **Ações**: Botão "Drill down" para detalhes

---

## 🚀 IMPLEMENTAÇÃO SUGERIDA

### Fase 1 (MVP) - 4 DORA Metrics
1. Lead Time
2. Cycle Time
3. Frequência de Deploy
4. Taxa de Falha de Mudança
5. MTTR

**Componentes**:
- `IndicatorLineChart.tsx`
- `IndicatorCard.tsx`
- `IndicatorGrid.tsx`

---

### Fase 2 - Top 10 Operacionais
6. Throughput
7. Confiabilidade de Compromisso
8. Eficiência de Fluxo
9. Taxa de Defeitos Escapados
10. Densidade de Defeitos
11. Tempo de Review de PR
12. Taxa de Sucesso de Build
13. Cobertura de Testes
14. Dívida Técnica
15. Lead Time de Mudanças

**Componentes**:
- `BoxPlot.tsx`
- `Histogram.tsx`
- `StackedBarChart.tsx`
- `Heatmap.tsx`

---

### Fase 3 - Restante + Avançados
16-51. Todos os outros

**Componentes**:
- `ScatterPlot.tsx`
- `ParetoChart.tsx`
- `ControlChart.tsx`
- `CFDChart.tsx`
- `Sparkline.tsx`

---

## 📦 BIBLIOTECAS RECOMENDADAS

1. **Recharts** (já instalado?)
   - Pros: React-first, declarativo, fácil
   - Contras: Customização limitada

2. **Victory** (alternativa)
   - Pros: Mais flexível, animações
   - Contras: Bundle maior

3. **D3.js** (para customizações)
   - Pros: Máximo controle
   - Contras: Imperativo, curva de aprendizado

4. **react-chartjs-2** (alternativa simples)
   - Pros: Chart.js familiar
   - Contras: Menos React-idiomático

**RECOMENDAÇÃO**: **Recharts** para 90% dos casos + **D3** para box plots e customizações.

---

## 📊 EXEMPLO DE IMPLEMENTAÇÃO

```typescript
// src/components/indicators/IndicatorLineChart.tsx
interface IndicatorLineChartProps {
  data: Array<{ date: string; value: number; target?: number }>;
  title: string;
  unit: string;
  target?: number;
  zones?: Array<{ min: number; max: number; color: string }>;
}

export const IndicatorLineChart: React.FC<IndicatorLineChartProps> = ({
  data,
  title,
  unit,
  target,
  zones
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis unit={unit} />
        <Tooltip />
        <Legend />
        
        {/* Zonas coloridas */}
        {zones?.map((zone, i) => (
          <ReferenceArea
            key={i}
            y1={zone.min}
            y2={zone.max}
            fill={zone.color}
            fillOpacity={0.1}
          />
        ))}
        
        {/* Linha de meta */}
        {target && (
          <ReferenceLine
            y={target}
            stroke="red"
            strokeDasharray="3 3"
            label="Meta"
          />
        )}
        
        {/* Dados */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Análise completa** (este documento)
2. ⏳ **Corrigir erros de gravação** (Squads/Usuários)
3. ⏳ **Criar componentes base** de gráficos
4. ⏳ **Implementar Fase 1** (4 DORA metrics)
5. ⏳ **Popular dados históricos** (seed ou import)
6. ⏳ **Implementar Fase 2** (Top 10)
7. ⏳ **Drill-down pages** para cada indicador
8. ⏳ **Alertas automáticos** (quando indicador fora de meta)

---

**Este documento serve como referência completa para desenvolvimento dos gráficos.**

**Priorize DORA metrics primeiro (maior ROI executivo)!**
