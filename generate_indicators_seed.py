import pandas as pd
from datetime import datetime

# Ler a planilha
file_path = '/home/user/uploaded_files/indicadores_eng_azuredevops_v3.xlsx'
df = pd.read_excel(file_path)

# Remover linhas vazias (se houver)
df = df.dropna(subset=['Indicador'])

print(f"Processando {len(df)} indicadores...")

# Gerar SQL
sql_output = """-- WK.metrics - Seed de Indicadores
-- Importação automática da planilha indicadores_eng_azuredevops_v3.xlsx
-- Total de indicadores: {}
-- Data de geração: {}

-- Limpar indicadores existentes (opcional - comentar se quiser manter)
-- DELETE FROM public.indicators;

-- Inserir indicadores
""".format(len(df), datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

for idx, row in df.iterrows():
    # Função para escapar strings SQL
    def escape_sql(value):
        if pd.isna(value):
            return 'NULL'
        value = str(value).replace("'", "''")
        return f"'{value}'"
    
    # Mapear campos
    priority = int(row['Prioridade']) if not pd.isna(row['Prioridade']) else 0
    name = escape_sql(row['Indicador'])
    acronym = escape_sql(row['Sigla'])
    tipo = escape_sql(row['Tipo (Upstream/Downstream)'])
    category = escape_sql(row['Categoria'])
    calculation_formula = escape_sql(row['Memória de Cálculo (Fórmula)'])
    description = escape_sql(row['Descrição / Objetivo'])
    action_when_bad = escape_sql(row['Ação quando a métrica estiver ruim'])
    result_when_good = escape_sql(row['Quando a métrica está boa (resultado esperado)'])
    suggested_target = escape_sql(row['Meta sugerida (baseline→alvo)'])
    default_granularity = escape_sql(row['Granularidade Padrão'])
    segmentation = escape_sql(row['Segmentação'])
    azure_devops_source = escape_sql(row['Fonte no Azure DevOps (campos/artefatos)'])
    base_query = escape_sql(row['Consulta base (WIQL / OData)'])
    
    sql_output += f"""
INSERT INTO public.indicators (
  is_active,
  is_kr,
  priority,
  name,
  acronym,
  type,
  category,
  description,
  objective,
  calculation_formula,
  action_when_bad,
  result_when_good,
  suggested_target,
  default_granularity,
  segmentation,
  azure_devops_source,
  base_query
) VALUES (
  true,
  false,
  {priority},
  {name},
  {acronym},
  {tipo},
  {category},
  {description},
  {description},
  {calculation_formula},
  {action_when_bad},
  {result_when_good},
  {suggested_target},
  {default_granularity},
  {segmentation},
  {azure_devops_source},
  {base_query}
);
"""

# Adicionar comentário final
sql_output += f"""
-- Total de indicadores inseridos: {len(df)}
-- Categorias únicas: {', '.join(df['Categoria'].dropna().unique())}
"""

# Salvar arquivo SQL
output_file = '/home/user/webapp/supabase/migrations/20251116000000_seed_indicators_from_spreadsheet.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(sql_output)

print(f"✅ Migration criada: {output_file}")
print(f"✅ Total de indicadores: {len(df)}")
print(f"\nCategorias encontradas:")
for cat in df['Categoria'].dropna().unique():
    count = len(df[df['Categoria'] == cat])
    print(f"  - {cat}: {count} indicadores")
