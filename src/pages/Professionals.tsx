import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCircle, Pencil, Trash2, PlusCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { Professional } from "@/lib/models";
import { useProfessionals } from "@/hooks/use-professionals";
import { useSquads } from "@/hooks/use-squads";
import { useJobRoles } from "@/hooks/use-job-roles";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString();

export default function Professionals() {
  const { professionals, isLoading: loadingProfessionals, addProfessional, updateProfessional, deleteProfessional } = useProfessionals();
  const { jobRoles, addJobRole } = useJobRoles();
  const { squads, addSquad } = useSquads();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);
  const [deleteProfessionalId, setDeleteProfessionalId] = useState<string | null>(null);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [isNewSquadDialogOpen, setIsNewSquadDialogOpen] = useState(false);
  const [isNewLeaderDialogOpen, setIsNewLeaderDialogOpen] = useState(false);
  const [isNewManagementRoleDialogOpen, setIsNewManagementRoleDialogOpen] = useState(false);
  const [isAddingLeader, setIsAddingLeader] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isAddingSquad, setIsAddingSquad] = useState(false);
  const [isAddingManagementRole, setIsAddingManagementRole] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleIsManagement, setNewRoleIsManagement] = useState(false);
  const [newManagementRoleTitle, setNewManagementRoleTitle] = useState("");
  const [newSquadData, setNewSquadData] = useState({ name: "", area: "" });
  const [newLeaderData, setNewLeaderData] = useState({ name: "", email: "", role: "" });
  const [formData, setFormData] = useState<Omit<Professional, "id">>({
    name: "",
    email: "",
    role: "",
    squad: "",
    seniority: "Pleno",
    profileType: "colaborador",
    avatar: undefined,
    managerId: undefined,
    managedSquads: [],
  });

  const roleOptions = useMemo(() => jobRoles.map((role) => role.title), [jobRoles]);
  const squadOptions = useMemo(() => 
    squads
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map((squad) => squad.name), 
    [squads]
  );

  // Filtra profissionais com cargos de gestão
  const managementProfessionals = useMemo(() => {
    const managementRoles = new Set(
      jobRoles.filter((role) => role.isManagement).map((role) => role.title)
    );
    return professionals.filter((p) => p.role && managementRoles.has(p.role));
  }, [professionals, jobRoles]);

  // Hierarquia de cargos para ordenação
  const hierarchyOrder: Record<string, number> = {
    diretoria: 1,
    diretor: 1,
    diretora: 1,
    gerencia: 2,
    gerente: 2,
    coordenacao: 3,
    coordenador: 3,
    coordenadora: 3,
    squad: 4,
  };

  const getHierarchyLevel = (role: string): number => {
    const normalizedRole = role.toLowerCase().trim();
    
    // Verifica se o cargo contém alguma das palavras-chave da hierarquia
    for (const [key, level] of Object.entries(hierarchyOrder)) {
      if (normalizedRole.includes(key)) {
        return level;
      }
    }
    
    // Se não encontrou nenhuma palavra-chave, retorna 5 (profissionais comuns)
    return 5;
  };

  // Ordena os profissionais por hierarquia
  const sortedProfessionals = useMemo(() => {
    return [...professionals].sort((a, b) => {
      const levelA = getHierarchyLevel(a.role || "");
      const levelB = getHierarchyLevel(b.role || "");
      
      // Ordena primeiro por nível hierárquico
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      
      // Se estiverem no mesmo nível, ordena por nome
      return a.name.localeCompare(b.name);
    });
  }, [professionals]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      squad: "",
      seniority: "Pleno",
      profileType: "colaborador",
      avatar: undefined,
      managerId: undefined,
      managedSquads: [],
    });
    setEditingProfessionalId(null);
  };

  const handleAddNewRole = async () => {
    if (!newRoleTitle.trim()) {
      toast.error("Informe o título do cargo.");
      return;
    }
    
    try {
      setIsAddingRole(true);
      await addJobRole({
        title: newRoleTitle.trim(),
        description: "",
        isManagement: newRoleIsManagement,
      });
      setFormData((prev) => ({ ...prev, role: newRoleTitle.trim() }));
      setNewRoleTitle("");
      setNewRoleIsManagement(false);
      setIsNewRoleDialogOpen(false);
    } catch (error) {
      // Toast já foi mostrado no hook
    } finally {
      setIsAddingRole(false);
    }
  };

  const handleAddNewManagementRole = async (roleTitle: string) => {
    if (!roleTitle.trim()) {
      toast.error("Informe o título do cargo.");
      return false;
    }
    
    try {
      setIsAddingManagementRole(true);
      await addJobRole({
        title: roleTitle.trim(),
        description: "",
        isManagement: true,
      });
      setNewLeaderData((prev) => ({ ...prev, role: roleTitle.trim() }));
      return true;
    } catch (error) {
      // Toast já foi mostrado no hook
      return false;
    } finally {
      setIsAddingManagementRole(false);
    }
  };

  const handleAddNewSquad = async () => {
    if (!newSquadData.name.trim()) {
      toast.error("Informe o nome do squad.");
      return;
    }
    
    try {
      setIsAddingSquad(true);
      await addSquad({
        name: newSquadData.name.trim(),
        area: newSquadData.area.trim(),
        description: "",
      });
      setFormData((prev) => ({ ...prev, squad: newSquadData.name.trim() }));
      setNewSquadData({ name: "", area: "" });
      setIsNewSquadDialogOpen(false);
    } catch (error) {
      // Toast já foi mostrado no hook
    } finally {
      setIsAddingSquad(false);
    }
  };

  const handleAddNewLeader = async () => {
    if (!newLeaderData.name.trim() || !newLeaderData.email.trim()) {
      toast.error("Informe o nome e e-mail da liderança.");
      return;
    }
    
    try {
      setIsAddingLeader(true);
      await addProfessional({
        name: newLeaderData.name.trim(),
        email: newLeaderData.email.trim(),
        role: newLeaderData.role.trim() || "Gestor",
        squad: "",
        seniority: "Sênior",
        profileType: "gestao",
        avatar: undefined,
        managerId: undefined,
        managedSquads: [],
      });
      
      setNewLeaderData({ name: "", email: "", role: "" });
      setIsNewLeaderDialogOpen(false);
      toast.success("Liderança criada com sucesso! Selecione-a na lista.");
    } catch (error) {
      toast.error("Erro ao criar liderança");
    } finally {
      setIsAddingLeader(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Informe nome e e-mail do profissional.");
      return;
    }

    try {
      setIsSaving(true);
      if (editingProfessionalId) {
        await updateProfessional(editingProfessionalId, formData);
      } else {
        await addProfessional(formData);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      // Toast já foi mostrado no hook
    } finally {
      setIsSaving(false);
    }
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
      managerId: professional.managerId,
      managedSquads: professional.managedSquads || [],
    });
    setEditingProfessionalId(professional.id);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteProfessionalId) {
      try {
        await deleteProfessional(deleteProfessionalId);
        setDeleteProfessionalId(null);
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
                  <Label className="text-center block">Foto do profissional</Label>
                  <div className="flex flex-col items-center gap-2">
                    <input
                      id="professional-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Avatar 
                      className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => document.getElementById('professional-avatar')?.click()}
                    >
                      <AvatarImage src={formData.avatar} alt={formData.name} />
                      <AvatarFallback>
                        {formData.name
                          .split(" ")
                          .map((part) => part.charAt(0))
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || <UserCircle className="h-12 w-12" />}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground text-center">
                      Clique na foto para selecionar uma imagem
                    </p>
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
                      <div
                        className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNewRoleDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Adicionar novo cargo</span>
                      </div>
                      {roleOptions.length === 0 ? (
                        <SelectItem value="no-roles" disabled>
                          Nenhum cargo cadastrado
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

                {formData.profileType !== "gestao" && (
                  <div className="space-y-2">
                    <Label htmlFor="professional-squad">Squad Principal</Label>
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
                        <div
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsNewSquadDialogOpen(true);
                          }}
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Adicionar novo squad</span>
                        </div>
                        {squadOptions.length === 0 ? (
                          <SelectItem value="no-squads" disabled>
                            Nenhum squad cadastrado
                          </SelectItem>
                        ) : (
                          squadOptions
                            .sort((a, b) => {
                              const squadA = squads.find(s => s.name === a);
                              const squadB = squads.find(s => s.name === b);
                              return (squadA?.order ?? 999) - (squadB?.order ?? 999);
                            })
                            .map((squadName) => (
                              <SelectItem key={squadName} value={squadName}>
                                {squadName}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="professional-manager">Liderança Imediata</Label>
                  <Select
                    value={formData.managerId}
                    onValueChange={(value) =>
                      setFormData((previous) => ({ ...previous, managerId: value === "none" ? undefined : value }))
                    }
                  >
                    <SelectTrigger id="professional-manager">
                      <SelectValue placeholder="Selecione a liderança" />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNewLeaderDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Adicionar nova liderança</span>
                      </div>
                      <SelectItem value="none">Nenhuma liderança</SelectItem>
                      {managementProfessionals.filter((p) => p.id !== editingProfessionalId).length === 0 ? (
                        <SelectItem value="no-professionals" disabled>
                          Nenhum profissional com cargo de gestão cadastrado
                        </SelectItem>
                      ) : (
                        managementProfessionals
                          .filter((p) => p.id !== editingProfessionalId)
                          .map((professional) => (
                            <SelectItem key={professional.id} value={professional.id}>
                              {professional.name} - {professional.role || "Sem cargo"}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
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
                    onValueChange={(value) => {
                      const newProfileType = value as Professional["profileType"];
                      setFormData((previous) => ({ 
                        ...previous, 
                        profileType: newProfileType,
                        // Limpar squad se mudar para gestão
                        squad: newProfileType === "gestao" ? "" : previous.squad
                      }));
                    }}
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

                {formData.profileType === "gestao" && (
                  <div className="space-y-3 rounded-lg border border-border/60 p-4">
                    <Label>Squads Gerenciados</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="squad-none"
                          checked={formData.managedSquads?.includes("Nenhum Squad")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData((previous) => ({ 
                                ...previous, 
                                managedSquads: ["Nenhum Squad"] 
                              }));
                            } else {
                              setFormData((previous) => ({ 
                                ...previous, 
                                managedSquads: [] 
                              }));
                            }
                          }}
                        />
                        <label
                          htmlFor="squad-none"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Nenhum Squad
                        </label>
                      </div>
                      {squads
                        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
                        .filter((squad) => squad.name !== "Nenhum Squad")
                        .map((squad) => (
                          <div key={squad.name} className="flex items-center space-x-2">
                            <Checkbox
                              id={`squad-${squad.name}`}
                              checked={formData.managedSquads?.includes(squad.name)}
                              disabled={formData.managedSquads?.includes("Nenhum Squad")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData((previous) => ({
                                    ...previous,
                                    managedSquads: [...(previous.managedSquads || []), squad.name],
                                  }));
                                } else {
                                  setFormData((previous) => ({
                                    ...previous,
                                    managedSquads: previous.managedSquads?.filter((s) => s !== squad.name) || [],
                                  }));
                                }
                              }}
                            />
                            <label
                              htmlFor={`squad-${squad.name}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {squad.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      editingProfessionalId ? "Salvar alterações" : "Salvar Profissional"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog para adicionar novo cargo */}
          <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cargo</DialogTitle>
                <DialogDescription>
                  Crie um novo cargo para selecionar no cadastro.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-role-title">Título do Cargo</Label>
                  <Input
                    id="new-role-title"
                    placeholder="Ex: Desenvolvedor Full Stack"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is-management">Cargo de Gestão</Label>
                    <p className="text-sm text-muted-foreground">
                      Marque se este cargo é de liderança
                    </p>
                  </div>
                  <Switch
                    id="is-management"
                    checked={newRoleIsManagement}
                    onCheckedChange={setNewRoleIsManagement}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewRoleDialogOpen(false)} disabled={isAddingRole}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNewRole} disabled={isAddingRole}>
                  {isAddingRole ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para adicionar novo cargo de gestão */}
          <Dialog open={isNewManagementRoleDialogOpen} onOpenChange={setIsNewManagementRoleDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cargo de Gestão</DialogTitle>
                <DialogDescription>
                  Crie um novo cargo de gestão para a liderança.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-management-role-title">Título do Cargo</Label>
                  <Input
                    id="new-management-role-title"
                    placeholder="Ex: Gerente de Projetos"
                    value={newManagementRoleTitle}
                    onChange={(e) => setNewManagementRoleTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewManagementRoleDialogOpen(false)} disabled={isAddingManagementRole}>
                  Cancelar
                </Button>
                <Button onClick={async () => {
                  const success = await handleAddNewManagementRole(newManagementRoleTitle);
                  if (success) {
                    setNewManagementRoleTitle("");
                    setIsNewManagementRoleDialogOpen(false);
                  }
                }} disabled={isAddingManagementRole}>
                  {isAddingManagementRole ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para adicionar novo squad */}
          <Dialog open={isNewSquadDialogOpen} onOpenChange={setIsNewSquadDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Squad</DialogTitle>
                <DialogDescription>
                  Crie um novo squad para selecionar no cadastro.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-squad-name">Nome do Squad</Label>
                  <Input
                    id="new-squad-name"
                    placeholder="Ex: Squad Phoenix"
                    value={newSquadData.name}
                    onChange={(e) => setNewSquadData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-squad-area">Área</Label>
                  <Input
                    id="new-squad-area"
                    placeholder="Ex: Desenvolvimento"
                    value={newSquadData.area}
                    onChange={(e) => setNewSquadData((prev) => ({ ...prev, area: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewSquadDialogOpen(false)} disabled={isAddingSquad}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNewSquad} disabled={isAddingSquad}>
                  {isAddingSquad ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para adicionar nova liderança */}
          <Dialog open={isNewLeaderDialogOpen} onOpenChange={setIsNewLeaderDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Liderança</DialogTitle>
                <DialogDescription>
                  Crie uma nova liderança para selecionar no cadastro.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-leader-name">Nome completo</Label>
                  <Input
                    id="new-leader-name"
                    placeholder="Ex: Maria Silva"
                    value={newLeaderData.name}
                    onChange={(e) => setNewLeaderData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-leader-email">E-mail</Label>
                  <Input
                    id="new-leader-email"
                    type="email"
                    placeholder="maria.silva@wk.com.br"
                    value={newLeaderData.email}
                    onChange={(e) => setNewLeaderData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-leader-role">Cargo</Label>
                  <Select
                    value={newLeaderData.role}
                    onValueChange={(value) => setNewLeaderData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger id="new-leader-role">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNewManagementRoleDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Adicionar novo cargo de gestão</span>
                      </div>
                      {roleOptions.filter((role) => {
                        const jobRole = jobRoles.find((jr) => jr.title === role);
                        return jobRole?.isManagement;
                      }).length === 0 ? (
                        <SelectItem value="no-roles" disabled>
                          Nenhum cargo de gestão cadastrado
                        </SelectItem>
                      ) : (
                        roleOptions.filter((role) => {
                          const jobRole = jobRoles.find((jr) => jr.title === role);
                          return jobRole?.isManagement;
                        }).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewLeaderDialogOpen(false)} disabled={isAddingLeader}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNewLeader} disabled={isAddingLeader}>
                  {isAddingLeader ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loadingProfessionals ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando profissionais...</p>
            </div>
          </div>
        ) : professionals.length > 0 ? (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Squad</TableHead>
                  <TableHead>Liderança</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Senioridade</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProfessionals.map((professional) => (
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
                      {professional.managedSquads && professional.managedSquads.length > 1 ? (
                        <span className="text-primary font-medium">Vários</span>
                      ) : professional.squad ? (
                        professional.squad
                      ) : (
                        <span className="text-muted-foreground text-sm">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {professional.managerId ? (
                        professionals.find((p) => p.id === professional.managerId)?.name || (
                          <span className="text-muted-foreground text-sm">Não encontrado</span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">Sem liderança</span>
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
