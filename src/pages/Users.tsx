import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Pencil, Trash2, Ban } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
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
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  avatar_url?: string;
}

export default function Users() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    is_admin: false,
  });

  const canManageUsers = hasPermission(["master", "admin"]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with their admin status
      const usersWithRoles = profiles?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        is_admin: roles?.some(r => r.user_id === profile.id && (r.role === "admin" || r.role === "master")) || false,
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ full_name: "", email: "", is_admin: false });
    setEditingUserId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error("Preencha nome e e-mail para adicionar o usuário.");
      return;
    }

    try {
      if (editingUserId) {
        // Update profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name,
            email: formData.email,
          })
          .eq("id", editingUserId);

        if (profileError) throw profileError;

        // Update user role
        const { data: existingRoles } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", editingUserId)
          .in("role", ["admin", "master"]);

        const hasAdminRole = existingRoles && existingRoles.length > 0;

        if (formData.is_admin && !hasAdminRole) {
          // Add admin role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: editingUserId, role: "admin" });

          if (roleError) throw roleError;
        } else if (!formData.is_admin && hasAdminRole) {
          // Remove admin role
          const { error: roleError } = await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", editingUserId)
            .eq("role", "admin");

          if (roleError) throw roleError;
        }

        toast.success("Usuário atualizado com sucesso!");
      } else {
        // For new users, we would need to create auth users first
        // This is typically done through Supabase Auth signup
        toast.error("Para criar novos usuários, use o sistema de cadastro/convite");
        return;
      }

      await loadUsers();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Erro ao salvar usuário");
    }
  };

  const handleEdit = (user: ManagedUser) => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      is_admin: user.is_admin,
    });
    setEditingUserId(user.id);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      // Delete user roles first (due to foreign key)
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", deleteUserId);

      if (rolesError) throw rolesError;

      // Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deleteUserId);

      if (profileError) throw profileError;

      toast.success("Usuário excluído com sucesso!");
      await loadUsers();
      setDeleteUserId(null);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário");
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

          {canManageUsers && editingUserId && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar usuário</DialogTitle>
                  <DialogDescription>
                    Atualize as informações e permissões do usuário.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Nome completo</Label>
                    <Input
                      id="user-name"
                      placeholder="Ex: Maria Souza"
                      value={formData.full_name}
                      onChange={(event) =>
                        setFormData((previous) => ({ ...previous, full_name: event.target.value }))
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-admin"
                      checked={formData.is_admin}
                      onCheckedChange={(checked) =>
                        setFormData((previous) => ({ ...previous, is_admin: checked as boolean }))
                      }
                    />
                    <Label htmlFor="is-admin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Usuário Administrador
                    </Label>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar alterações</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>Carregando usuários...</p>
            </div>
          </Card>
        ) : users.length > 0 ? (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  {canManageUsers && <TableHead className="w-[120px] text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">{user.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge className="border-primary/30 bg-primary/10 text-primary" variant="outline">
                          Administrador
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted-foreground/30 bg-muted/10 text-muted-foreground">
                          Usuário
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
              <p className="text-lg mb-2">Nenhum usuário cadastrado</p>
              <p className="text-sm">Os usuários serão exibidos aqui quando forem criados</p>
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
