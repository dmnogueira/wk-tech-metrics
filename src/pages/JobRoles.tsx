import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Briefcase, Pencil, Trash2 } from "lucide-react";
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
import { JobRole } from "@/lib/models";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString();

export default function JobRolesPage() {
  const [roles, setRoles] = useLocalStorage<JobRole[]>("job-roles", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<JobRole, "id">>({
    title: "",
    description: "",
  });

  const canManageRoles = hasPermission(["master", "admin"]);

  const resetForm = () => {
    setFormData({ title: "", description: "" });
    setEditingRoleId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Informe o nome do cargo ou função.");
      return;
    }

    if (editingRoleId) {
      setRoles((previous) =>
        previous.map((role) => (role.id === editingRoleId ? { ...role, ...formData } : role)),
      );
      toast.success("Cargo atualizado com sucesso!");
    } else {
      const newRole: JobRole = {
        id: createId(),
        ...formData,
      };
      setRoles((previous) => [...previous, newRole]);
      toast.success("Cargo cadastrado com sucesso!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (role: JobRole) => {
    setFormData({ title: role.title, description: role.description });
    setEditingRoleId(role.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (roleId: string) => {
    setRoles((previous) => previous.filter((role) => role.id !== roleId));
    toast.success("Cargo removido com sucesso!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Cargos e Funções</h1>
            <p className="text-muted-foreground">
              Cadastre cargos para padronizar o cadastro de profissionais e squads.
            </p>
          </div>

          {canManageRoles && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo cargo ou função
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRoleId ? "Editar cargo" : "Novo cargo ou função"}</DialogTitle>
                  <DialogDescription>
                    Estruture cargos e funções para agilizar a criação de profissionais.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-title">Nome do cargo</Label>
                    <Input
                      id="role-title"
                      placeholder="Ex: Engenheiro de Software"
                      value={formData.title}
                      onChange={(event) =>
                        setFormData((previous) => ({ ...previous, title: event.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-description">Descrição</Label>
                    <Textarea
                      id="role-description"
                      placeholder="Descreva responsabilidades e atribuições."
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
                    <Button type="submit">{editingRoleId ? "Salvar alterações" : "Salvar cargo"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {roles.length > 0 ? (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo / Função</TableHead>
                  <TableHead>Descrição</TableHead>
                  {canManageRoles && <TableHead className="w-[120px]">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {role.title.charAt(0).toUpperCase()}
                        </Badge>
                        <span>{role.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || "Sem descrição cadastrada."}
                    </TableCell>
                    {canManageRoles && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(role.id)}
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
              <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhum cargo cadastrado</p>
              <p className="text-sm">Clique em "Novo cargo ou função" para começar</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
