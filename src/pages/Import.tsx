import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export default function Import() {
  const handleDownloadTemplate = () => {
    toast.success("Template CSV baixado com sucesso!");
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Métricas importadas com sucesso!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Importar Métricas
          </h1>
          <p className="text-muted-foreground">
            Importe métricas mensais via formulário ou arquivo CSV
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload CSV */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Upload CSV</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Faça o upload de um arquivo CSV com as métricas do mês. 
                Baixe o template para ver o formato correto.
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Template CSV
              </Button>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste o arquivo CSV aqui ou clique para selecionar
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                />
                <Label
                  htmlFor="csv-upload"
                  className="cursor-pointer text-primary hover:underline text-sm"
                >
                  Selecionar arquivo
                </Label>
              </div>

              <Button className="w-full bg-secondary hover:bg-secondary/90">
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
            </div>
          </Card>

          {/* Formulário Manual */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Entrada Manual</h2>
            </div>

            <form onSubmit={handleImport} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Mês</Label>
                  <Input
                    id="month"
                    type="month"
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squad">Squad (opcional)</Label>
                  <Input
                    id="squad"
                    type="text"
                    placeholder="Ex: Controladoria"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bugs-criticos">Bugs Críticos</Label>
                <Input
                  id="bugs-criticos"
                  type="number"
                  placeholder="0"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retencao">Retenção de Bugs (%)</Label>
                <Input
                  id="retencao"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bugs-usuario">Bugs por Usuário</Label>
                <Input
                  id="bugs-usuario"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações sobre as métricas deste mês..."
                  className="bg-background min-h-[100px]"
                />
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                Salvar Métricas
              </Button>
            </form>
          </Card>
        </div>

        {/* Histórico de Importações */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Histórico de Importações
          </h2>
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma importação realizada ainda</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
