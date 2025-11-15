-- Seed de indicadores de exemplo baseados no PRD WK.metrics
-- Estes são exemplos representativos das 50 métricas mencionadas no PRD

-- Categoria: Fluxo/Entrega
INSERT INTO public.indicators (
  is_active, is_kr, priority, name, acronym, type, category,
  description, calculation_formula, suggested_target,
  default_granularity, segmentation
) VALUES
(
  true, true, 100,
  'Lead Time',
  'LT',
  'Downstream',
  'Fluxo/Entrega',
  'Tempo médio entre o início do desenvolvimento e a entrega em produção',
  'Mediana do tempo entre o primeiro commit e o deploy em produção',
  '< 5 dias',
  'Mensal',
  'Por Squad'
),
(
  true, false, 90,
  'Cycle Time',
  'CT',
  'Downstream',
  'Fluxo/Entrega',
  'Tempo médio de desenvolvimento ativo de uma funcionalidade',
  'Mediana do tempo entre o primeiro commit e o último commit antes do deploy',
  '< 3 dias',
  'Mensal',
  'Por Squad'
),
(
  true, false, 85,
  'Throughput',
  'TP',
  'Downstream',
  'Fluxo/Entrega',
  'Quantidade de entregas realizadas no período',
  'Contagem de work items concluídos e deployados',
  '> 20 por mês',
  'Mensal',
  'Por Squad'
);

-- Categoria: Qualidade
INSERT INTO public.indicators (
  is_active, is_kr, priority, name, acronym, type, category,
  description, calculation_formula, action_when_bad, result_when_good,
  suggested_target, default_granularity, segmentation
) VALUES
(
  true, true, 95,
  'Bugs Críticos',
  'BC',
  'Downstream',
  'Qualidade',
  'Quantidade de bugs críticos em produção',
  'Contagem de bugs com severidade crítica reportados no período',
  'Revisar processo de QA, aumentar cobertura de testes, realizar análise de causa raiz',
  'Processo de qualidade está funcionando adequadamente',
  'baseline 15 → alvo 5',
  'Mensal',
  'Por Squad'
),
(
  true, false, 85,
  'Taxa de Retenção de Bugs',
  'TRB',
  'Upstream',
  'Qualidade',
  'Percentual de bugs encontrados antes da produção',
  '(Bugs encontrados em QA / Total de bugs) * 100',
  'Melhorar processo de testes, treinamento da equipe',
  'Alta retenção indica processo de QA eficaz',
  '> 80%',
  'Mensal',
  'Por Squad'
),
(
  true, true, 90,
  'Code Coverage',
  'CC',
  'Upstream',
  'Qualidade',
  'Percentual de cobertura de testes automatizados',
  'Percentual de linhas de código cobertas por testes unitários e integração',
  'Criar testes para áreas críticas, estabelecer política de cobertura mínima',
  'Código bem testado e protegido contra regressões',
  '> 80%',
  'Mensal',
  'Por Produto'
);

-- Categoria: DevOps/DORA
INSERT INTO public.indicators (
  is_active, is_kr, priority, name, acronym, type, category,
  description, calculation_formula, suggested_target,
  default_granularity, segmentation
) VALUES
(
  true, true, 100,
  'Deployment Frequency',
  'DF',
  'Downstream',
  'DevOps/DORA',
  'Frequência de deploys em produção',
  'Quantidade de deploys em produção por período',
  '> 1 por dia (Elite) ou > 1 por semana (High)',
  'Semanal',
  'Por Squad'
),
(
  true, true, 95,
  'Change Failure Rate',
  'CFR',
  'Downstream',
  'DevOps/DORA',
  'Taxa de falha em mudanças deployadas',
  '(Deploys com falha / Total de deploys) * 100',
  '< 15% (Elite) ou < 30% (High)',
  'Mensal',
  'Por Squad'
),
(
  true, false, 90,
  'Mean Time to Recovery',
  'MTTR',
  'Downstream',
  'DevOps/DORA',
  'Tempo médio para recuperação de falhas',
  'Mediana do tempo entre a detecção de um incidente e a restauração do serviço',
  '< 1 hora (Elite) ou < 1 dia (High)',
  'Mensal',
  'Por Produto'
);

-- Categoria: Planejamento
INSERT INTO public.indicators (
  is_active, is_kr, priority, name, acronym, type, category,
  description, calculation_formula, suggested_target,
  default_granularity, segmentation
) VALUES
(
  true, true, 85,
  'Backlog Refinado',
  'BR',
  'Upstream',
  'Planejamento',
  'Percentual do backlog refinado e pronto para desenvolvimento',
  '(Stories refinadas / Total de stories no backlog) * 100',
  '> 70%',
  'Sprint',
  'Por Squad'
),
(
  true, false, 80,
  'Velocidade (Story Points)',
  'VEL',
  'Downstream',
  'Planejamento',
  'Quantidade média de story points entregues por sprint',
  'Média de story points completados nas últimas 3 sprints',
  'Baseline individual por squad',
  'Sprint',
  'Por Squad'
);

-- Categoria: SRE & Disponibilidade
INSERT INTO public.indicators (
  is_active, is_kr, priority, name, acronym, type, category,
  description, calculation_formula, suggested_target,
  default_granularity, segmentation
) VALUES
(
  true, true, 100,
  'Disponibilidade (Uptime)',
  'UP',
  'Downstream',
  'SRE & Disponibilidade',
  'Percentual de tempo em que o sistema está disponível',
  '(Tempo total - Tempo de downtime) / Tempo total * 100',
  '> 99.9%',
  'Mensal',
  'Por Produto'
),
(
  true, false, 90,
  'Número de Incidentes',
  'INC',
  'Downstream',
  'SRE & Disponibilidade',
  'Quantidade de incidentes de produção no período',
  'Contagem de incidentes P1 e P2 reportados',
  '< 5 por mês',
  'Mensal',
  'Por Produto'
),
(
  true, false, 85,
  'Iniciativas Técnicas Concluídas',
  'ITC',
  'Upstream',
  'SRE & Disponibilidade',
  'Percentual de iniciativas técnicas (refatoração, débito técnico) concluídas',
  '(Iniciativas técnicas concluídas / Total planejado) * 100',
  '> 80%',
  'Trimestral',
  'Geral'
);

-- Observação: Este é um subset de exemplo dos indicadores.
-- O PRD menciona ~50 indicadores, que podem ser adicionados incrementalmente
-- conforme a necessidade de cada squad e área.
