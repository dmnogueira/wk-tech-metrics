import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Configure metas e parâmetros do sistema
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Metas dos KPIs</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eficiencia-meta">Meta de Eficiência (%)</Label>
                <Input
                  id="eficiencia-meta"
                  type="number"
                  defaultValue="85"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backlog-meta">Meta de Backlog Refinado (%)</Label>
                <Input
                  id="backlog-meta"
                  type="number"
                  defaultValue="50"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage-meta">Meta de Code Coverage (%)</Label>
                <Input
                  id="coverage-meta"
                  type="number"
                  defaultValue="100"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bugs-usuario-meta">Meta de Bugs/Usuário</Label>
                <Input
                  id="bugs-usuario-meta"
                  type="number"
                  step="0.01"
                  defaultValue="0.26"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disponibilidade-meta">Meta de Disponibilidade (%)</Label>
                <Input
                  id="disponibilidade-meta"
                  type="number"
                  step="0.01"
                  defaultValue="99.9"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iniciativas-meta">Meta de Iniciativas Técnicas (%)</Label>
                <Input
                  id="iniciativas-meta"
                  type="number"
                  step="0.01"
                  defaultValue="7.5"
                  className="bg-background"
                />
              </div>
            </div>

            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
