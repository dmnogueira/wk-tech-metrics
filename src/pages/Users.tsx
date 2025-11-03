import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Pencil, Trash2, Ban } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { hasPermission } from "@/lib/auth";

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  blocked?: boolean;
}

const initialUsers: ManagedUser[] = [
  {
    id: 1,
    name: "Denilson Nogueira",
    email: "denilson.nogueira@wk.com.br",
    role: "Administrador",
  },
];

export default function Users() {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<ManagedUser, "id">>({
    name: "",
    email: "",
    role: "Colaborador",
    blocked: false,
  });

  const canManageUsers = hasPermission(["master", "admin"]);

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "Colaborador", blocked: false });
    setEditingUserId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Preencha nome e e-mail para adicionar o usuário.");
      return;
    }

    if (editingUserId) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === editingUserId ? { ...user, ...formData } : user
        )
      );
      toast.success("Usuário atualizado com sucesso!");
    } else {
      const newUser: ManagedUser = {
        id: Date.now(),
        ...formData,
      };
      setUsers((previous) => [...previous, newUser]);
      toast.success("Usuário adicionado com sucesso!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (user: ManagedUser) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      blocked: user.blocked || false,
    });
    setEditingUserId(user.id);
    setIsDialogOpen(true);
  };

  const handleToggleBlock = (userId: number) => {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === userId ? { ...user, blocked: !user.blocked } : user
      )
    );
    const user = users.find((u) => u.id === userId);
    toast.success(user?.blocked ? "Usuário desbloqueado com sucesso!" : "Usuário bloqueado com sucesso!");
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      setUsers((previous) => previous.filter((user) => user.id !== deleteUserId));
      toast.success("Usuário excluído com sucesso!");
      setDeleteUserId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Usuários</h1>
            <p className="text-muted-foreground">Gerencie usuários e permissões do sistema</p>
          </div>

          {canManageUsers && (
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
                  Novo Usuário
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUserId ? "Editar usuário" : "Adicionar usuário"}</DialogTitle>
                  <DialogDescription>
                    Registre um novo usuário para acompanhar as métricas e definir permissões.
                  </DialogDescription>
                </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Nome completo</Label>
                  <Input
                    id="user-name"
                    placeholder="Ex: Maria Souza"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, name: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-email">E-mail</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="nome.sobrenome@wk.com.br"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, email: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-role">Perfil de acesso</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData((previous) => ({ ...previous, role: value }))
                    }
                  >
                    <SelectTrigger id="user-role">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Gestor">Gestor</SelectItem>
                      <SelectItem value="Colaborador">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingUserId ? "Salvar alterações" : "Salvar Usuário"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {users.length > 0 ? (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  {canManageUsers && <TableHead className="w-[180px] text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge className="border-primary/30 bg-primary/10 text-primary" variant="outline">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.blocked ? (
                        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                          Bloqueado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                          Ativo
                        </Badge>
                      )}
                    </TableCell>
                    {canManageUsers && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleBlock(user.id)}
                            className={user.blocked ? "" : "text-warning hover:text-warning"}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteUserId(user.id)}
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
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhum usuário adicional cadastrado</p>
              <p className="text-sm">Clique em "Novo Usuário" para começar</p>
            </div>
          </Card>
        )}

        <AlertDialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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
