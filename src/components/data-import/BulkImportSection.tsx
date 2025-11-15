import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useIndicators } from "@/hooks/use-indicators";
import { useBulkCreateIndicatorValues } from "@/hooks/use-indicator-values";
import { IndicatorValueFormData } from "@/types/indicators";
import { toast } from "@/hooks/use-toast";

interface ImportResult {
  success: number;
  errors: number;
  details: string[];
}

export function BulkImportSection() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: indicators } = useIndicators(true);
  const bulkCreate = useBulkCreateIndicatorValues();

  const generateTemplate = () => {
    // Generate CSV template
    const headers = [
      "indicator_acronym",
      "period_type",
      "period_start",
      "period_end",
      "value",
      "text_value",
      "squad_name",
      "product_name",
      "status",
      "comparison_value",
    ];

    const exampleRow = [
      "LT",
      "mensal",
      "2024-01-01",
      "2024-01-31",
      "4.5",
      "",
      "Squad Alpha",
      "WK.app",
      "excellent",
      "5.2",
    ];

    const csv = [
      headers.join(","),
      exampleRow.join(","),
      "# Preencha com seus dados abaixo",
      "# Status: critical, warning, excellent, neutral",
      "# Period Type: sprint, mensal, trimestral, anual",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_importacao_indicadores.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Template baixado",
      description: "O arquivo template foi baixado com sucesso.",
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const parseCSV = async (fileContent: string): Promise<IndicatorValueFormData[]> => {
    const lines = fileContent.split("\n").filter(line => line.trim() && !line.startsWith("#"));
    const headers = lines[0].split(",").map(h => h.trim());
    
    const values: IndicatorValueFormData[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map(cell => cell.trim());
      if (row.length < headers.length) continue;

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });

      // Find indicator by acronym
      const indicator = indicators?.find(
        ind => ind.acronym.toLowerCase() === rowData.indicator_acronym?.toLowerCase()
      );

      if (!indicator) {
        errors.push(`Linha ${i + 1}: Indicador "${rowData.indicator_acronym}" não encontrado`);
        continue;
      }

      try {
        const value: IndicatorValueFormData = {
          indicator_id: indicator.id,
          period_type: rowData.period_type as any,
          period_start: rowData.period_start,
          period_end: rowData.period_end,
          value: rowData.value ? parseFloat(rowData.value) : undefined,
          text_value: rowData.text_value || undefined,
          product_name: rowData.product_name || undefined,
          status: (rowData.status || "neutral") as any,
          source: "import",
          comparison_value: rowData.comparison_value ? parseFloat(rowData.comparison_value) : undefined,
        };

        values.push(value);
      } catch (error) {
        errors.push(`Linha ${i + 1}: Erro ao processar dados`);
      }
    }

    if (errors.length > 0) {
      setImportResult({
        success: values.length,
        errors: errors.length,
        details: errors,
      });
    }

    return values;
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setImportResult(null);

    try {
      const fileContent = await file.text();
      const values = await parseCSV(fileContent);

      if (values.length === 0) {
        toast({
          title: "Nenhum dado válido",
          description: "Não foram encontrados dados válidos para importar.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      await bulkCreate.mutateAsync(values);

      setImportResult({
        success: values.length,
        errors: 0,
        details: [`${values.length} registros importados com sucesso`],
      });

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Template */}
      <div className="space-y-2">
        <Label>1. Baixe o Template</Label>
        <p className="text-sm text-muted-foreground">
          Faça o download do arquivo modelo com as colunas necessárias
        </p>
        <Button onClick={generateTemplate} variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Baixar Template CSV
        </Button>
      </div>

      {/* Upload File */}
      <div className="space-y-2">
        <Label>2. Preencha e Faça Upload</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Preencha o template com seus dados e faça o upload do arquivo
        </p>
        <div className="flex items-center gap-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button
            onClick={handleImport}
            disabled={!file || isProcessing}
            size="lg"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isProcessing ? "Processando..." : "Importar"}
          </Button>
        </div>
        {file && (
          <p className="text-sm text-muted-foreground">
            Arquivo selecionado: {file.name}
          </p>
        )}
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="space-y-3">
          <Label>Resultado da Importação</Label>
          {importResult.success > 0 && (
            <Alert className="border-success">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription>
                {importResult.success} registros importados com sucesso
              </AlertDescription>
            </Alert>
          )}
          {importResult.errors > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {importResult.errors} erros encontrados
              </AlertDescription>
            </Alert>
          )}
          {importResult.details.length > 0 && (
            <div className="rounded-lg border p-4 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Detalhes
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {importResult.details.map((detail, index) => (
                  <li key={index}>• {detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dicas:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Use o formato de data YYYY-MM-DD (ex: 2024-01-31)</li>
            <li>• Os valores de status devem ser: critical, warning, excellent ou neutral</li>
            <li>• O campo indicator_acronym deve corresponder à sigla cadastrada</li>
            <li>• Linhas que começam com # serão ignoradas</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
