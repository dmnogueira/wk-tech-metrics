import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCircle, Pencil, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { JobRole, Professional, Squad } from "@/lib/models";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString();

export default function Professionals() {
  const [professionals, setProfessionals] = useLocalStorage<Professional[]>("professionals", []);
  const [jobRoles] = useLocalStorage<JobRole[]>("job-roles", []);
  const [squads] = useLocalStorage<Squad[]>("squads", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);
  const [deleteProfessionalId, setDeleteProfessionalId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Professional, "id">>({
    name: "",
    email: "",
    role: "",
    squad: "",
    seniority: "Pleno",
    profileType: "colaborador",
    avatar: undefined,
  });

  const roleOptions = useMemo(() => jobRoles.map((role) => role.title), [jobRoles]);
  const squadOptions = useMemo(() => squads.map((squad) => squad.name), [squads]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      squad: "",
      seniority: "Pleno",
      profileType: "colaborador",
      avatar: undefined,
    });
    setEditingProfessionalId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Informe nome e e-mail do profissional.");
      return;
    }

    if (editingProfessionalId) {
      setProfessionals((previous) =>
        previous.map((professional) =>
          professional.id === editingProfessionalId ? { ...professional, ...formData } : professional,
        ),
      );
      toast.success("Profissional atualizado com sucesso!");
    } else {
      const newProfessional: Professional = {
        id: createId(),
        ...formData,
      };

      setProfessionals((previous) => [...previous, newProfessional]);
      toast.success("Profissional cadastrado com sucesso!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormData((previous) => ({ ...previous, avatar: undefined }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((previous) => ({ ...previous, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (professional: Professional) => {
    setFormData({
      name: professional.name,
      email: professional.email,
      role: professional.role,
      squad: professional.squad,
      seniority: professional.seniority,
      profileType: professional.profileType,
      avatar: professional.avatar,
    });
    setEditingProfessionalId(professional.id);
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteProfessionalId) {
      setProfessionals((previous) => previous.filter((professional) => professional.id !== deleteProfessionalId));
      toast.success("Profissional removido com sucesso!");
      setDeleteProfessionalId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Profissionais</h1>
            <p className="text-muted-foreground">Gerencie profissionais e suas associações</p>
          </div>

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
                Novo Profissional
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProfessionalId ? "Editar profissional" : "Adicionar profissional"}</DialogTitle>
                <DialogDescription>
                  Registre membros de squads para acompanhar performance e alocação.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="professional-avatar">Foto do profissional</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={formData.avatar} alt={formData.name} />
                      <AvatarFallback>
                        {formData.name
                          .split(" ")
                          .map((part) => part.charAt(0))
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "PR"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        id="professional-avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Utilize imagens quadradas para melhor enquadramento. Elas serão exibidas em formato circular.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional-name">Nome completo</Label>
                  <Input
                    id="professional-name"
                    placeholder="Ex: João Pereira"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, name: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional-email">E-mail</Label>
                  <Input
                    id="professional-email"
                    type="email"
                    placeholder="nome.sobrenome@wk.com.br"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, email: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="professional-role">Cargo / Função</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData((previous) => ({ ...previous, role: value }))
                      }
                    >
                      <SelectTrigger id="professional-role">
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.length === 0 ? (
                          <SelectItem value="no-roles" disabled>
                            Cadastre cargos e funções para selecionar aqui.
                          </SelectItem>
                        ) : (
                          roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professional-squad">Squad</Label>
                    <Select
                      value={formData.squad}
                      onValueChange={(value) =>
                        setFormData((previous) => ({ ...previous, squad: value }))
                      }
                    >
                      <SelectTrigger id="professional-squad">
                        <SelectValue placeholder="Selecione o squad" />
                      </SelectTrigger>
                      <SelectContent>
                        {squadOptions.length === 0 ? (
                          <SelectItem value="no-squads" disabled>
                            Cadastre squads para disponibilizar nesta lista.
                          </SelectItem>
                        ) : (
                          squadOptions.map((squadName) => (
                            <SelectItem key={squadName} value={squadName}>
                              {squadName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional-seniority">Senioridade</Label>
                  <Select
                    value={formData.seniority}
                    onValueChange={(value) =>
                      setFormData((previous) => ({ ...previous, seniority: value }))
                    }
                  >
                    <SelectTrigger id="professional-seniority">
                      <SelectValue placeholder="Selecione a senioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Júnior">Júnior</SelectItem>
                      <SelectItem value="Pleno">Pleno</SelectItem>
                      <SelectItem value="Sênior">Sênior</SelectItem>
                      <SelectItem value="Especialista">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional-profile">Perfil de atuação</Label>
                  <Select
                    value={formData.profileType}
                    onValueChange={(value) =>
                      setFormData((previous) => ({ ...previous, profileType: value as Professional["profileType"] }))
                    }
                  >
                    <SelectTrigger id="professional-profile">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gestao">Gestão</SelectItem>
                      <SelectItem value="especialista">Especialista</SelectItem>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingProfessionalId ? "Salvar alterações" : "Salvar Profissional"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {professionals.length > 0 ? (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Squad</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Senioridade</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={professional.avatar} alt={professional.name} />
                        <AvatarFallback>
                          {professional.name
                            .split(" ")
                            .map((part) => part.charAt(0))
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "PR"}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{professional.name}</TableCell>
                    <TableCell className="text-muted-foreground">{professional.email}</TableCell>
                    <TableCell>
                      {professional.role ? (
                        professional.role
                      ) : (
                        <span className="text-muted-foreground text-sm">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {professional.squad ? professional.squad : (
                        <span className="text-muted-foreground text-sm">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground">
                        {professional.profileType === "gestao"
                          ? "Gestão"
                          : professional.profileType === "especialista"
                            ? "Especialista"
                            : professional.profileType === "admin"
                              ? "Admin"
                              : "Colaborador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="border-info/30 bg-info/10 text-info" variant="outline">
                        {professional.seniority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(professional)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteProfessionalId(professional.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <UserCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhum profissional cadastrado</p>
              <p className="text-sm">Clique em "Novo Profissional" para começar</p>
            </div>
          </Card>
        )}

        <AlertDialog open={deleteProfessionalId !== null} onOpenChange={(open) => !open && setDeleteProfessionalId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.
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
