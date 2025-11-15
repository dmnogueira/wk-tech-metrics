import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Esta é uma versão inicial - pode ser expandida conforme necessidade
export function DataConnectionsSection() {
  const [connections, setConnections] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Fontes de Dados Configuradas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie conexões com APIs externas para sincronização automática
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Conexão
        </Button>
      </div>

      {/* Alert informativo */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Funcionalidade em Desenvolvimento</strong>
          <p className="mt-2 text-sm">
            A automação de coleta de dados via APIs será implementada em fases futuras.
            Por enquanto, utilize o input manual ou a importação em lote.
          </p>
        </AlertDescription>
      </Alert>

      {/* Lista de Conexões */}
      {connections.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma conexão configurada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure integrações com Azure DevOps, SonarQube, Jira ou APIs customizadas
          </p>
          <Button onClick={() => setIsFormOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeira Conexão
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Ativa</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Última Sincronização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Em breve você poderá configurar conexões automáticas aqui
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Seção de Planejamento Futuro */}
      <div className="rounded-lg border p-6 bg-muted/20">
        <h4 className="font-semibold mb-4">Integrações Planejadas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🔷</span>
            </div>
            <div>
              <h5 className="font-medium">Azure DevOps</h5>
              <p className="text-sm text-muted-foreground">
                Work Items, Releases, Boards, Test Plans
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <h5 className="font-medium">SonarQube</h5>
              <p className="text-sm text-muted-foreground">
                Métricas de qualidade de código, bugs, vulnerabilidades
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h5 className="font-medium">Jira</h5>
              <p className="text-sm text-muted-foreground">
                Issues, Sprints, Velocidade, Lead Time
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🔌</span>
            </div>
            <div>
              <h5 className="font-medium">APIs Customizadas</h5>
              <p className="text-sm text-muted-foreground">
                Webhooks e integrações com ferramentas internas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="rounded-lg border p-6">
        <h4 className="font-semibold mb-4">Roadmap de Automação</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Fase 1</Badge>
            <span className="text-sm">Estrutura de tabelas e mapeamentos (Concluído)</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Fase 2</Badge>
            <span className="text-sm">Interface de configuração de conexões</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Fase 3</Badge>
            <span className="text-sm">Workers de sincronização e agendamento</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Fase 4</Badge>
            <span className="text-sm">Logs de execução e alertas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
