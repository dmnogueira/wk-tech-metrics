import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Users, Pencil, Trash2, PlusCircle, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { hasPermission } from "@/lib/auth";
import { Squad } from "@/lib/models";
import { useSquads } from "@/hooks/use-squads";
import { useProfessionals } from "@/hooks/use-professionals";

export default function Squads() {
  const { squads, isLoading, addSquad, updateSquad, deleteSquad } = useSquads();
  const { professionals } = useProfessionals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSquadId, setEditingSquadId] = useState<string | null>(null);
  const [deleteSquadId, setDeleteSquadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Squad, "id">>({
    name: "",
    area: "",
    description: "",
    managerId: undefined,
    order: undefined,
  });

  // Ordena squads por ordem
  const sortedSquads = useMemo(() => {
    return [...squads].sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
  }, [squads]);

  // Verifica se é o squad "Nenhum Squad" que não pode ser editado/deletado
  const isProtectedSquad = (squadName: string) => {
    return squadName === "Nenhum Squad";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Informe o nome do squad.");
      return;
    }

    // Verifica se está tentando editar um squad protegido
    const editingSquad = squads.find(s => s.id === editingSquadId);
    if (editingSquad && isProtectedSquad(editingSquad.name)) {
      toast.error("O squad 'Nenhum Squad' não pode ser editado.");
      return;
    }

    try {
      if (editingSquadId) {
        await updateSquad(editingSquadId, formData);
      } else {
        await addSquad(formData);
      }
      
      setFormData({ name: "", area: "", description: "", managerId: undefined, order: undefined });
      setEditingSquadId(null);
      setIsDialogOpen(false);
    } catch (error) {
      // Toast já foi mostrado no hook
    }
  };

  const managers = useMemo(
    () =>
      professionals.filter((professional) => professional.profileType === "gestao" || professional.profileType === "admin"),
    [professionals],
  );

  const handleEdit = (squad: Squad) => {
    // Verifica se é um squad protegido
    if (isProtectedSquad(squad.name)) {
      toast.error("O squad 'Nenhum Squad' não pode ser editado.");
      return;
    }
    
    setFormData({ 
      name: squad.name, 
      area: squad.area, 
      description: squad.description, 
      managerId: squad.managerId,
      order: squad.order 
    });
    setEditingSquadId(squad.id);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteSquadId) {
      // Verifica se é um squad protegido
      const squadToDelete = squads.find(s => s.id === deleteSquadId);
      if (squadToDelete && isProtectedSquad(squadToDelete.name)) {
        toast.error("O squad 'Nenhum Squad' não pode ser deletado.");
        setDeleteSquadId(null);
        return;
      }

      try {
        await deleteSquad(deleteSquadId);
        setDeleteSquadId(null);
      } catch (error) {
        // Toast já foi mostrado no hook
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Squads</h1>
            <p className="text-muted-foreground">Gerencie os squads e suas configurações</p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setFormData({ name: "", area: "", description: "", managerId: undefined, order: undefined });
                setEditingSquadId(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Squad
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSquadId ? "Editar squad" : "Registrar novo squad"}</DialogTitle>
                <DialogDescription>
                  Informe os detalhes para organizar equipes multidisciplinares no monitoramento.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="squad-name">Nome do squad</Label>
                  <Input
                    id="squad-name"
                    placeholder="Ex: Controle Financeiro"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, name: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squad-area">Área de atuação</Label>
                  <Input
                    id="squad-area"
                    placeholder="Ex: Controladoria"
                    value={formData.area}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, area: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squad-order">Ordem de exibição</Label>
                  <Input
                    id="squad-order"
                    type="number"
                    min="1"
                    placeholder="Ex: 1"
                    value={formData.order ?? ""}
                    onChange={(event) =>
                      setFormData((previous) => ({ 
                        ...previous, 
                        order: event.target.value ? parseInt(event.target.value) : undefined 
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Define a ordem de exibição nos comboboxes. Se deixar vazio, será adicionado ao final.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squad-manager">Gestão do squad</Label>
                  <Select
                    value={formData.managerId ?? ""}
                    onValueChange={(value) =>
                      setFormData((previous) => ({ ...previous, managerId: value || undefined }))
                    }
                  >
                    <SelectTrigger id="squad-manager">
                      <SelectValue placeholder="Selecione o responsável pela gestão" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.length === 0 ? (
                        <SelectItem value="no-managers" disabled>
                          Cadastre profissionais com perfil de gestão para selecionar aqui.
                        </SelectItem>
                      ) : (
                        managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squad-description">Descrição</Label>
                  <Textarea
                    id="squad-description"
                    placeholder="Detalhe a missão principal do squad"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, description: event.target.value }))
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingSquadId ? "Salvar alterações" : "Salvar Squad"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando squads...</p>
            </div>
          </div>
        ) : sortedSquads.length > 0 ? (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Squad</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Gestão</TableHead>
                  <TableHead>Descrição</TableHead>
                  {hasPermission(["master", "admin"]) && <TableHead className="w-[120px] text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSquads.map((squad) => {
                  const isProtected = isProtectedSquad(squad.name);
                  return (
                    <TableRow key={squad.id}>
                      <TableCell className="font-medium">
                        <Badge variant="secondary">{squad.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                          {squad.area || "Não informado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {squad.managerId
                          ? managers.find((m) => m.id === squad.managerId)?.name || (
                              <span className="text-muted-foreground text-sm">Gestão não atribuída</span>
                            )
                          : "Gestão não atribuída"}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {squad.description || (
                          <span className="text-muted-foreground text-sm">Sem descrição cadastrada.</span>
                        )}
                      </TableCell>
                      {hasPermission(["master", "admin"]) && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(squad)}
                              disabled={isProtected}
                              title={isProtected ? "Squad protegido - não pode ser editado" : "Editar squad"}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteSquadId(squad.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={isProtected}
                              title={isProtected ? "Squad protegido - não pode ser deletado" : "Deletar squad"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhum squad cadastrado</p>
              <p className="text-sm">Clique em "Novo Squad" para começar</p>
            </div>
          </Card>
        )}

        <AlertDialog open={deleteSquadId !== null} onOpenChange={(open) => !open && setDeleteSquadId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este squad? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}