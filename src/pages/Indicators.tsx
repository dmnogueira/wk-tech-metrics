import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useIndicators, useToggleIndicatorActive, useDeleteIndicator } from "@/hooks/use-indicators";
import { IndicatorForm } from "@/components/indicators/IndicatorForm";
import { Indicator } from "@/types/indicators";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Indicators() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<string | null>(null);

  const { data: indicators, isLoading } = useIndicators(!showAll);
  const toggleActive = useToggleIndicatorActive();
  const deleteIndicator = useDeleteIndicator();

  const filteredIndicators = indicators?.filter(
    (indicator) =>
      indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedIndicator(null);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (indicatorToDelete) {
      await deleteIndicator.mutateAsync(indicatorToDelete);
      setIndicatorToDelete(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await toggleActive.mutateAsync({ id, isActive: !currentStatus });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Indicadores</h1>
            <p className="text-muted-foreground mt-2">
              Configure os indicadores técnicos que serão rastreados no sistema
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Novo Indicador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedIndicator ? "Editar Indicador" : "Novo Indicador"}
                </DialogTitle>
              </DialogHeader>
              <IndicatorForm
                indicator={selectedIndicator}
                onSuccess={() => {
                  setIsFormOpen(false);
                  setSelectedIndicator(null);
                }}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedIndicator(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, sigla ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={showAll}
              onCheckedChange={setShowAll}
              id="show-all"
            />
            <label htmlFor="show-all" className="text-sm font-medium cursor-pointer">
              Mostrar todos (incluindo inativos)
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Ativo</TableHead>
                <TableHead className="w-[50px]">KR</TableHead>
                <TableHead className="w-[80px]">Prioridade</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Sigla</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando indicadores...
                  </TableCell>
                </TableRow>
              ) : filteredIndicators?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhum indicador encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredIndicators?.map((indicator) => (
                  <TableRow key={indicator.id}>
                    <TableCell>
                      <Switch
                        checked={indicator.is_active}
                        onCheckedChange={() =>
                          handleToggleActive(indicator.id, indicator.is_active)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {indicator.is_kr && (
                        <Badge variant="secondary">KR</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{indicator.priority}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{indicator.name}</TableCell>
                    <TableCell>
                      <Badge variant="default">{indicator.acronym}</Badge>
                    </TableCell>
                    <TableCell>
                      {indicator.type && (
                        <Badge variant={indicator.type === 'Upstream' ? 'default' : 'secondary'}>
                          {indicator.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{indicator.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(indicator)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIndicatorToDelete(indicator.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!indicatorToDelete} onOpenChange={() => setIndicatorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este indicador? Esta ação não pode ser desfeita
              e todos os dados associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
