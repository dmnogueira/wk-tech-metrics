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
import { Plus, Users, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { hasPermission } from "@/lib/auth";
import { Professional, Squad } from "@/lib/models";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString();

export default function Squads() {
  const [squads, setSquads] = useLocalStorage<Squad[]>("squads", []);
  const [professionals] = useLocalStorage<Professional[]>("professionals", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSquadId, setEditingSquadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Squad, "id">>({
    name: "",
    area: "",
    description: "",
    managerId: undefined,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Informe o nome do squad.");
      return;
    }
    const buildSquad = (base: Omit<Squad, "id">, id?: string): Squad => ({
      id: id ?? createId(),
      ...base,
    });

    if (editingSquadId) {
      setSquads((previous) =>
        previous.map((squad) => (squad.id === editingSquadId ? buildSquad(formData, editingSquadId) : squad)),
      );
      toast.success("Squad atualizado com sucesso!");
    } else {
      const newSquad = buildSquad(formData);
      setSquads((previous) => [...previous, newSquad]);
      toast.success("Squad criado com sucesso!");
    }

    setFormData({ name: "", area: "", description: "", managerId: undefined });
    setEditingSquadId(null);
    setIsDialogOpen(false);
  };

  const managers = useMemo(
    () =>
      professionals.filter((professional) => professional.profileType === "gestao" || professional.profileType === "admin"),
    [professionals],
  );

  const handleEdit = (squad: Squad) => {
    setFormData({ name: squad.name, area: squad.area, description: squad.description, managerId: squad.managerId });
    setEditingSquadId(squad.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (squadId: string) => {
    setSquads((previous) => previous.filter((squad) => squad.id !== squadId));
    toast.success("Squad removido com sucesso!");
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
                setFormData({ name: "", area: "", description: "", managerId: undefined });
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
                        <SelectItem value="" disabled>
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

        {squads.length > 0 ? (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Squad</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Gestão</TableHead>
                  <TableHead>Descrição</TableHead>
                  {hasPermission(["master", "admin"]) && <TableHead className="w-[120px]">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {squads.map((squad) => (
                  <TableRow key={squad.id}>
                    <TableCell className="font-medium text-foreground">{squad.name}</TableCell>
                    <TableCell>
                      {squad.area ? (
                        <Badge className="border-secondary/30 bg-secondary/10 text-secondary" variant="outline">
                          {squad.area}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Área não informada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {squad.managerId ? (
                        <Badge className="border-primary/30 bg-primary/10 text-primary" variant="outline">
                          {managers.find((manager) => manager.id === squad.managerId)?.name ?? "Gestor removido"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Gestão não atribuída</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {squad.description || "Sem descrição cadastrada."}
                    </TableCell>
                    {hasPermission(["master", "admin"]) && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(squad)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(squad.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
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
      </div>
    </DashboardLayout>
  );
}
