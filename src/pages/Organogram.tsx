import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Users2,
  UserCog,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Briefcase,
  Plus,
  Layers3,
} from "lucide-react";
import { toast } from "sonner";
import { hasPermission } from "@/lib/auth";
import { Professional } from "@/lib/models";
import { useProfessionals } from "@/hooks/use-professionals";
import { useSquads } from "@/hooks/use-squads";
import { useJobRoles } from "@/hooks/use-job-roles";

export default function Organogram() {
  const { professionals, isLoading: loadingProfessionals, addProfessional, updateProfessional, deleteProfessional } = useProfessionals();
  const { squads, isLoading: loadingSquads } = useSquads();
  const { jobRoles, isLoading: loadingJobRoles } = useJobRoles();
  
  const [selectedSquadId, setSelectedSquadId] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Professional, "id">>({
    profileId: "",
    name: "",
    email: "",
    role: "",
    squad: "",
    seniority: "Pleno",
    profileType: "colaborador",
    avatar: undefined,
    managedSquads: [],
  });

  const canEditProfessionals = hasPermission(["master", "admin", "gestao"]);

  const roleOptions = useMemo(() => jobRoles.map((role) => role.title), [jobRoles]);
  const squadOptions = useMemo(() => 
    squads.map((squad) => squad.name), 
    [squads]
  );

  // Hierarquia de cargos para ordenação
  const getHierarchyLevel = (role: string): number => {
    const normalizedRole = role.toLowerCase().trim();
    
    if (normalizedRole.includes("diretor")) return 1;
    if (normalizedRole.includes("gerente") || normalizedRole.includes("gerencia")) return 2;
    if (normalizedRole.includes("coordenador") || normalizedRole.includes("coordenacao")) return 3;
    if (normalizedRole.includes("squad") || normalizedRole.includes("tech lead") || normalizedRole.includes("lead")) return 4;
    
    return 5; // profissionais comuns
  };

  // Estrutura hierárquica simplificada
  const hierarchicalProfessionals = useMemo(() => {
    if (!professionals || professionals.length === 0) {
      return { allProfessionals: [], rootProfessionals: [] };
    }

    // Filtra profissionais baseado no squad selecionado
    let filteredPros = professionals;
    if (selectedSquadId !== "all") {
      const selectedSquad = squads.find((s) => s.id === selectedSquadId);
      if (selectedSquad) {
        filteredPros = professionals.filter((p) => 
          p.squad === selectedSquad.name || p.managedSquads?.includes(selectedSquad.name)
        );
      }
    }

    // Encontra profissionais raiz (sem managerId ou managerId não existe mais)
    const rootProfessionals = filteredPros
      .filter((p) => !p.managerId || !filteredPros.find((m) => m.id === p.managerId))
      .sort((a, b) => {
        const levelA = getHierarchyLevel(a.role || "");
        const levelB = getHierarchyLevel(b.role || "");
        if (levelA !== levelB) return levelA - levelB;
        return a.name.localeCompare(b.name);
      });

    return { allProfessionals: filteredPros, rootProfessionals };
  }, [professionals, squads, selectedSquadId]);

  interface ProfessionalCardProps {
    professional: Professional;
    showDragHandle?: boolean;
    showManagedSquads?: boolean;
  }

  const ProfessionalCard = ({
    professional,
    showDragHandle = true,
    showManagedSquads = true,
  }: ProfessionalCardProps) => {
    return (
      <div className="relative rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/40">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {canEditProfessionals && showDragHandle && (
              <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
            )}

            <Avatar className="h-9 w-9 border border-primary/40">
              <AvatarImage src={professional.avatar} alt={professional.name} />
              <AvatarFallback className="text-xs">
                {professional.name
                  .split(" ")
                  .map((part) => part.charAt(0))
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {professional.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {professional.role || "Função não definida"}
              </p>

              {professional.squad && (
                <p className="mt-1 text-xs font-medium text-primary truncate">
                  Squad: {professional.squad}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-1">
            <Badge variant="outline" className="text-xs px-1.5 py-0 border-info/40 text-info">
              {professional.seniority}
            </Badge>

            {canEditProfessionals && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleEditProfessional(professional)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteProfessional(professional.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        {showManagedSquads &&
          professional.profileType === "gestao" &&
          professional.managedSquads &&
          professional.managedSquads.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1 flex-wrap">
                <Briefcase className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Gerencia:</span>
                {professional.managedSquads.map((sq) => (
                  <Badge key={sq} variant="secondary" className="text-xs px-1 py-0">
                    {sq}
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </div>
    );
  };

  interface HierarchyNodeProps {
    professional: Professional;
    allProfessionals: Professional[];
    level: number;
    hideParentConnector?: boolean;
    showManagedSquads?: boolean;
    showDragHandle?: boolean;
    excludeSquadNames?: string[];
  }

  interface SquadNodeProps {
    squadName: string;
    coordinator?: Professional;
    members: Professional[];
    allProfessionals: Professional[];
    level: number;
    excludeSquadNames: string[];
  }

  const SquadNode = ({
    squadName,
    coordinator,
    members,
    allProfessionals,
    level,
    excludeSquadNames,
  }: SquadNodeProps) => {
    return (
      <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-primary">{squadName}</p>
          <Badge variant="secondary" className="ml-auto text-[10px] uppercase bg-primary text-primary-foreground">
            Squad
          </Badge>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Coordenador
            </p>
            {coordinator ? (
              <HierarchyNode
                professional={coordinator}
                allProfessionals={allProfessionals}
                level={level}
                hideParentConnector
                showManagedSquads={false}
                showDragHandle={false}
                excludeSquadNames={excludeSquadNames}
              />
            ) : (
              <div className="text-xs text-muted-foreground border border-dashed border-border rounded-md px-3 py-2 bg-background/40">
                Nenhum coordenador atribuído
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Profissionais
            </p>
            {members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <HierarchyNode
                    key={member.id}
                    professional={member}
                    allProfessionals={allProfessionals}
                    level={level}
                    hideParentConnector
                    showManagedSquads={false}
                    showDragHandle={false}
                    excludeSquadNames={excludeSquadNames}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground border border-dashed border-border rounded-md px-3 py-2 bg-background/40">
                Nenhum profissional vinculado
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const HierarchyNode = ({
    professional,
    allProfessionals,
    level,
    hideParentConnector = false,
    showManagedSquads = true,
    showDragHandle = true,
    excludeSquadNames = [],
  }: HierarchyNodeProps) => {
    const [isOpen, setIsOpen] = useState(true);

    // Encontra os subordinados diretos
    const subordinates = allProfessionals
      .filter((p) => p.managerId === professional.id)
      .sort((a, b) => {
        const levelA = getHierarchyLevel(a.role || "");
        const levelB = getHierarchyLevel(b.role || "");
        if (levelA !== levelB) return levelA - levelB;
        return a.name.localeCompare(b.name);
      });

    const validManagedSquads = professional.profileType === "gestao"
      ? (professional.managedSquads || []).filter(
          (squadName) =>
            squadName &&
            squadName !== "Nenhum Squad" &&
            !excludeSquadNames.includes(squadName)
        )
      : [];

    const squadStructures = validManagedSquads.map((squadName) => {
      const squadInfo = squads.find((sq) => sq.name === squadName);

      const coordinatorFromSquad = squadInfo
        ? allProfessionals.find((p) => p.profileId === squadInfo.managerId)
        : undefined;

      const fallbackCoordinator = allProfessionals
        .filter((p) => p.managerId === professional.id && p.squad === squadName)
        .sort((a, b) => {
          const levelA = getHierarchyLevel(a.role || "");
          const levelB = getHierarchyLevel(b.role || "");
          if (levelA !== levelB) return levelA - levelB;
          return a.name.localeCompare(b.name);
        })[0];

      const coordinator =
        coordinatorFromSquad && coordinatorFromSquad.id !== professional.id
          ? coordinatorFromSquad
          : fallbackCoordinator;

      const members = allProfessionals
        .filter((p) => p.squad === squadName && p.id !== coordinator?.id && p.id !== professional.id)
        .sort((a, b) => {
          const levelA = getHierarchyLevel(a.role || "");
          const levelB = getHierarchyLevel(b.role || "");
          if (levelA !== levelB) return levelA - levelB;
          return a.name.localeCompare(b.name);
        });

      const idsToOmit = new Set<string>();
      if (coordinator) idsToOmit.add(coordinator.id);
      members.forEach((member) => idsToOmit.add(member.id));

      return {
        squadName,
        coordinator,
        members,
        idsToOmit,
      };
    });

    const idsBelongingToSquads = new Set<string>();
    squadStructures.forEach((structure) => {
      structure.idsToOmit.forEach((id) => idsBelongingToSquads.add(id));
    });

    const filteredSubordinates = subordinates.filter((subordinate) => !idsBelongingToSquads.has(subordinate.id));

    const hasSubordinates = filteredSubordinates.length > 0 || squadStructures.length > 0;

    return (
      <div className="relative">
        {level > 0 && !hideParentConnector && (
          <div className="absolute left-4 top-0 w-px h-4 bg-border" />
        )}

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start gap-1">
            {hasSubordinates && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 mt-1"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
            {!hasSubordinates && <div className="w-6" />}

            {/* Card compacto do profissional */}
            <div className="flex-1 mb-2 max-w-md">
              <ProfessionalCard
                professional={professional}
                showDragHandle={showDragHandle}
                showManagedSquads={showManagedSquads}
              />
            </div>
          </div>

          {/* Subordinados */}
          {hasSubordinates && (
            <CollapsibleContent>
              <div className="ml-6 space-y-1 relative">
                <div className="absolute left-4 top-0 bottom-2 w-px bg-border" />

                {[
                  ...filteredSubordinates.map((subordinate) => ({
                    key: subordinate.id,
                    node: (
                      <HierarchyNode
                        professional={subordinate}
                        allProfessionals={allProfessionals}
                        level={level + 1}
                        excludeSquadNames={excludeSquadNames}
                      />
                    ),
                  })),
                  ...squadStructures.map((structure) => ({
                    key: `squad-${structure.squadName}`,
                    node: (
                      <SquadNode
                        squadName={structure.squadName}
                        coordinator={structure.coordinator}
                        members={structure.members}
                        allProfessionals={allProfessionals}
                        level={level + 1}
                        excludeSquadNames={[...excludeSquadNames, structure.squadName]}
                      />
                    ),
                  })),
                ].map((child) => (
                  <div key={child.key} className="relative">
                    <div className="absolute left-4 top-4 w-4 h-px bg-border" />
                    {child.node}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    );
  };

  const resetForm = () => {
    setFormData({
      profileId: "",
      name: "",
      email: "",
      role: "",
      squad: "",
      seniority: "Pleno",
      profileType: "colaborador",
      avatar: undefined,
      managedSquads: [],
    });
    setEditingProfessionalId(null);
  };

  const handleEditProfessional = (professional: Professional) => {
    setFormData({
      profileId: professional.profileId,
      name: professional.name,
      email: professional.email,
      role: professional.role,
      squad: professional.squad,
      seniority: professional.seniority,
      profileType: professional.profileType,
      avatar: professional.avatar,
      managedSquads: professional.managedSquads || [],
    });
    setEditingProfessionalId(professional.id);
    setIsDialogOpen(true);
  };

  const handleDeleteProfessional = async (professionalId: string) => {
    try {
      await deleteProfessional(professionalId);
    } catch (error) {
      // Toast já foi mostrado no hook
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (!editingProfessionalId) {
        await addProfessional(formData);
      } else {
        await updateProfessional(editingProfessionalId, formData);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      // Toast já foi mostrado no hook
    }
  };

  // Mostra loading enquanto carrega dados
  if (loadingProfessionals || loadingSquads || loadingJobRoles) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando organograma...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Organograma</h1>
            <p className="text-muted-foreground">
              Visualize a estrutura organizacional da empresa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedSquadId} onValueChange={setSelectedSquadId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione um squad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os squads</SelectItem>
                {squads.map((squad) => (
                  <SelectItem key={squad.id} value={squad.id}>
                    {squad.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canEditProfessionals && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <UserCog className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)] min-h-[420px] rounded-md border border-border/60">
          <div className="p-4">
            {hierarchicalProfessionals.rootProfessionals.length > 0 ? (
              <Card className="border-border/60">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <Users2 className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">
                      Estrutura Organizacional
                    </h2>
                    <Badge variant="outline" className="text-muted-foreground ml-auto">
                      {hierarchicalProfessionals.allProfessionals.length} {hierarchicalProfessionals.allProfessionals.length === 1 ? "pessoa" : "pessoas"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {hierarchicalProfessionals.rootProfessionals.map((professional) => (
                      <HierarchyNode
                        key={professional.id}
                        professional={professional}
                        allProfessionals={hierarchicalProfessionals.allProfessionals}
                        level={0}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <Users2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum profissional encontrado</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Adicione profissionais para visualizar a estrutura hierárquica da organização.
                </p>
                {canEditProfessionals && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar primeiro profissional
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Dialog para adicionar/editar profissional */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProfessionalId ? "Editar Profissional" : "Adicionar Profissional"}
            </DialogTitle>
            <DialogDescription>
              Ajuste alocações ou cadastre novos profissionais diretamente no organograma.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="professional-name">Nome completo</Label>
                <Input
                  id="professional-name"
                  placeholder="Nome do profissional"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((previous) => ({ ...previous, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional-email">E-mail</Label>
                <Input
                  id="professional-email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((previous) => ({ ...previous, email: e.target.value }))
                  }
                  required
                />
              </div>
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
                    {squadOptions.length === 0 ? (
                      <SelectItem value="no-squads" disabled>
                        Nenhum squad cadastrado
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {squadOptions
                    .filter((squadName) => squadName !== "Nenhum Squad")
                    .map((squadName) => (
                      <div key={squadName} className="flex items-center space-x-2">
                        <Checkbox
                          id={`squad-${squadName}`}
                          checked={formData.managedSquads?.includes(squadName)}
                          disabled={formData.managedSquads?.includes("Nenhum Squad")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData((previous) => ({
                                ...previous,
                                managedSquads: [...(previous.managedSquads || []), squadName],
                              }));
                            } else {
                              setFormData((previous) => ({
                                ...previous,
                                managedSquads: previous.managedSquads?.filter((s) => s !== squadName) || [],
                              }));
                            }
                          }}
                        />
                        <label
                          htmlFor={`squad-${squadName}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {squadName}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingProfessionalId ? "Salvar alterações" : "Salvar Profissional"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}