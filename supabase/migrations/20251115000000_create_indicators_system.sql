-- WK.metrics - Sistema de Indicadores
-- Migration para criar estrutura de indicadores, dados e conexões

-- Tabela de Indicadores (Módulo 2: Gestão de Indicadores)
CREATE TABLE IF NOT EXISTS public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Controles de exibição
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_kr BOOLEAN DEFAULT false NOT NULL,
  priority INTEGER DEFAULT 0 NOT NULL,
  
  -- Informações básicas
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  type TEXT CHECK (type IN ('Upstream', 'Downstream')),
  category TEXT NOT NULL, -- Usado para agrupar no dashboard
  
  -- Descrições e documentação
  description TEXT,
  objective TEXT,
  calculation_formula TEXT,
  action_when_bad TEXT,
  result_when_good TEXT,
  
  -- Meta e configurações
  suggested_target TEXT, -- Ex: "< 5 dias" ou "baseline 10% → alvo 5%"
  default_granularity TEXT, -- Sprint, Mensal, Trimestral, etc.
  segmentation TEXT, -- Por Squad, Por Produto, etc.
  
  -- Integração Azure DevOps
  azure_devops_source TEXT,
  base_query TEXT, -- WIQL / OData query
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX idx_indicators_active ON public.indicators(is_active);
CREATE INDEX idx_indicators_category ON public.indicators(category);
CREATE INDEX idx_indicators_priority ON public.indicators(priority);

-- Tabela de Valores de Indicadores (Módulo 3: Dados)
CREATE TABLE IF NOT EXISTS public.indicator_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID REFERENCES public.indicators(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do valor
  value NUMERIC,
  text_value TEXT, -- Para indicadores não numéricos
  
  -- Segmentação temporal
  period_type TEXT NOT NULL, -- 'sprint', 'mensal', 'trimestral', 'anual'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Segmentação organizacional
  squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL,
  product_name TEXT,
  
  -- Metadados
  comparison_value NUMERIC, -- Valor anterior para comparação
  comparison_percentage NUMERIC, -- % de variação
  status TEXT CHECK (status IN ('critical', 'warning', 'excellent', 'neutral')) DEFAULT 'neutral',
  
  -- Origem do dado
  source TEXT DEFAULT 'manual', -- 'manual', 'import', 'api', 'azure_devops'
  import_batch_id UUID, -- Para rastreabilidade de importações em lote
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraint para evitar duplicatas
  UNIQUE(indicator_id, period_start, period_end, squad_id)
);

-- Índices para queries do dashboard
CREATE INDEX idx_indicator_values_indicator ON public.indicator_values(indicator_id);
CREATE INDEX idx_indicator_values_period ON public.indicator_values(period_start, period_end);
CREATE INDEX idx_indicator_values_squad ON public.indicator_values(squad_id);
CREATE INDEX idx_indicator_values_status ON public.indicator_values(status);

-- Tabela de Fontes de Dados / Conexões (Módulo 3: Automação)
CREATE TABLE IF NOT EXISTS public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuração da fonte
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'azure_devops', 'sonarqube', 'jira', 'custom_api'
  
  -- Credenciais (criptografadas no código)
  connection_config JSONB NOT NULL, -- { url, token, org, project, etc }
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status TEXT, -- 'success', 'error', 'partial'
  last_sync_message TEXT,
  
  -- Agendamento
  sync_frequency TEXT, -- 'daily', 'weekly', 'manual'
  sync_schedule_cron TEXT, -- Expressão cron se necessário
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tabela de Mapeamento Indicador -> Fonte de Dados
CREATE TABLE IF NOT EXISTS public.indicator_data_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID REFERENCES public.indicators(id) ON DELETE CASCADE NOT NULL,
  data_source_id UUID REFERENCES public.data_sources(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuração do mapeamento
  query_config JSONB, -- Query específica, filtros, transformações
  field_mapping JSONB, -- Como mapear campos da API para o valor do indicador
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(indicator_id, data_source_id)
);

-- Tabela de Lotes de Importação (para rastreabilidade)
CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações do lote
  filename TEXT,
  record_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  errors JSONB, -- Array de erros encontrados
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_data_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies para indicators
CREATE POLICY "Anyone can view active indicators"
  ON public.indicators FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage indicators"
  ON public.indicators FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

-- RLS Policies para indicator_values
CREATE POLICY "Anyone authenticated can view indicator values"
  ON public.indicator_values FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage indicator values"
  ON public.indicator_values FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
    OR public.has_role(auth.uid(), 'gestao')
  );

-- RLS Policies para data_sources
CREATE POLICY "Admins can view data sources"
  ON public.data_sources FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

CREATE POLICY "Admins can manage data sources"
  ON public.data_sources FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

-- RLS Policies para indicator_data_mappings
CREATE POLICY "Admins can view mappings"
  ON public.indicator_data_mappings FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

CREATE POLICY "Admins can manage mappings"
  ON public.indicator_data_mappings FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

-- RLS Policies para import_batches
CREATE POLICY "Admins can view import batches"
  ON public.import_batches FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

CREATE POLICY "Admins can create import batches"
  ON public.import_batches FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master')
  );

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_indicators
  BEFORE UPDATE ON public.indicators
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_indicator_values
  BEFORE UPDATE ON public.indicator_values
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_data_sources
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
