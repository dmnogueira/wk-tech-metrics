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
import { Plus, Users, Pencil, Trash2, PlusCircle } from "lucide-react";
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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { hasPermission } from "@/lib/auth";
import { Professional, Squad } from "@/lib/models";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString();

export default function Squads() {
  const [squads, setSquads] = useLocalStorage<Squad[]>("squads", []);
  const [professionals, setProfessionals] = useLocalStorage<Professional[]>("professionals", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSquadId, setEditingSquadId] = useState<string | null>(null);
  const [deleteSquadId, setDeleteSquadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Squad, "id">>({
    name: "",
    area: "",
    description: "",
    managerId: undefined,
  });
  const [isNewManagerDialogOpen, setIsNewManagerDialogOpen] = useState(false);
  const [newManagerData, setNewManagerData] = useState({
    name: "",
    email: "",
    role: "",
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

  const handleCreateNewManager = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newManagerData.name.trim();
    const trimmedEmail = newManagerData.email.trim();
    const trimmedRole = newManagerData.role.trim();

    if (!trimmedName || !trimmedEmail) {
      toast.error("Informe nome e e-mail do gestor.");
      return;
    }

    const alreadyExists = professionals.some(
      (professional) => professional.email.toLowerCase() === trimmedEmail.toLowerCase(),
    );

    if (alreadyExists) {
      toast.error("Já existe um profissional cadastrado com este e-mail.");
      return;
    }

    const newManager: Professional = {
      id: createId(),
      name: trimmedName,
      email: trimmedEmail,
      role: trimmedRole || "Gestor",
      squad: "",
      seniority: "Pleno",
      profileType: "gestao",
    };

    setProfessionals((previous) => [...previous, newManager]);
    setFormData((previous) => ({ ...previous, managerId: newManager.id }));
    setIsNewManagerDialogOpen(false);
    setNewManagerData({ name: "", email: "", role: "" });
    toast.success("Gestor cadastrado com sucesso!");
  };

  const confirmDelete = () => {
    if (deleteSquadId) {
      setSquads((previous) => previous.filter((squad) => squad.id !== deleteSquadId));
      toast.success("Squad removido com sucesso!");
      setDeleteSquadId(null);
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
                      <div
                        className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsNewManagerDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Adicionar novo gestor</span>
                      </div>
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

          <Dialog
            open={isNewManagerDialogOpen}
            onOpenChange={(open) => {
              setIsNewManagerDialogOpen(open);
              if (!open) {
                setNewManagerData({ name: "", email: "", role: "" });
              }
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar novo gestor</DialogTitle>
                <DialogDescription>
                  Cadastre rapidamente o responsável pela gestão deste squad.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateNewManager} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-manager-name">Nome completo</Label>
                  <Input
                    id="new-manager-name"
                    placeholder="Ex: Ana Oliveira"
                    value={newManagerData.name}
                    onChange={(event) =>
                      setNewManagerData((previous) => ({ ...previous, name: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-manager-email">E-mail</Label>
                  <Input
                    id="new-manager-email"
                    type="email"
                    placeholder="nome.sobrenome@wk.com.br"
                    value={newManagerData.email}
                    onChange={(event) =>
                      setNewManagerData((previous) => ({ ...previous, email: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-manager-role">Cargo / Função</Label>
                  <Input
                    id="new-manager-role"
                    placeholder="Ex: Head de Tecnologia"
                    value={newManagerData.role}
                    onChange={(event) =>
                      setNewManagerData((previous) => ({ ...previous, role: event.target.value }))
                    }
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsNewManagerDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Adicionar gestor</Button>
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
                            onClick={() => setDeleteSquadId(squad.id)}
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
