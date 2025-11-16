import pandas as pd
import json

# Ler a planilha
file_path = '/home/user/uploaded_files/indicadores_eng_azuredevops_v3.xlsx'
df = pd.read_excel(file_path)

# Mostrar informações básicas
print("="*80)
print("ANÁLISE DA PLANILHA DE INDICADORES")
print("="*80)
print(f"\nTotal de linhas: {len(df)}")
print(f"\nColunas disponíveis ({len(df.columns)}):")
for i, col in enumerate(df.columns, 1):
    print(f"  {i}. {col}")

print("\n" + "="*80)
print("PRIMEIRAS 3 LINHAS DE DADOS:")
print("="*80)
print(df.head(3).to_string())

print("\n" + "="*80)
print("RESUMO DOS DADOS:")
print("="*80)
print(df.info())

# Salvar preview dos dados em JSON para análise
preview = df.head(5).to_dict(orient='records')
with open('/tmp/indicators_preview.json', 'w', encoding='utf-8') as f:
    json.dump(preview, f, indent=2, ensure_ascii=False, default=str)

print("\n" + "="*80)
print("Preview salvo em: /tmp/indicators_preview.json")
print("="*80)
