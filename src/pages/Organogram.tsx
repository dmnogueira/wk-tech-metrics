import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Pencil, Trash2, Users2, UserCog, ChevronDown, ChevronRight, GripVertical, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { hasPermission } from "@/lib/auth";
import { JobRole, Professional, Squad } from "@/lib/models";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString();

export default function Organogram() {
  const [professionals, setProfessionals] = useLocalStorage<Professional[]>("professionals", []);
  const [squads] = useLocalStorage<Squad[]>("squads", []);
  const [jobRoles] = useLocalStorage<JobRole[]>("job-roles", []);
  const [selectedSquadId, setSelectedSquadId] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);
  const [draggedProfessionalId, setDraggedProfessionalId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Professional, "id">>({
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
    squads
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map((squad) => squad.name), 
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

  // Estrutura de árvore hierárquica por squad
  const groupedProfessionals = useMemo(() => {
    const grouping = new Map<string, Professional[]>();
    professionals.forEach((professional) => {
      const groupKey = professional.squad || "Sem squad";
      const existing = grouping.get(groupKey) ?? [];
      existing.push(professional);
      grouping.set(groupKey, existing);
    });

    return Array.from(grouping.entries()).map(([group, members]) => ({
      squadName: group,
      members,
      metadata: squads.find((squad) => squad.name === group) ?? null,
    }));
  }, [professionals, squads]);

  const filteredGroups = groupedProfessionals.filter((group) => {
    if (selectedSquadId === "all") {
      return true;
    }
    return group.metadata?.id === selectedSquadId;
  });

  // Drag and Drop handlers
  const handleDragStart = (professionalId: string) => {
    setDraggedProfessionalId(professionalId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnProfessional = (targetProfessionalId: string) => {
    if (!draggedProfessionalId || draggedProfessionalId === targetProfessionalId) return;

    setProfessionals((prev) =>
      prev.map((p) =>
        p.id === draggedProfessionalId
          ? { ...p, managerId: targetProfessionalId }
          : p
      )
    );

    toast.success("Hierarquia atualizada com sucesso!");
    setDraggedProfessionalId(null);
  };

  const handleDropOnSquad = (squadName: string) => {
    if (!draggedProfessionalId) return;

    setProfessionals((prev) =>
      prev.map((p) =>
        p.id === draggedProfessionalId
          ? { ...p, squad: squadName, managerId: undefined }
          : p
      )
    );

    toast.success("Profissional movido para outro squad!");
    setDraggedProfessionalId(null);
  };

  // Componente para renderizar um profissional e seus subordinados
  interface HierarchyNodeProps {
    professional: Professional;
    allProfessionals: Professional[];
    level: number;
  }

  const HierarchyNode = ({ professional, allProfessionals, level }: HierarchyNodeProps) => {
    const [isOpen, setIsOpen] = useState(true);
    
    // Encontra os subordinados diretos deste profissional
    const subordinates = allProfessionals
      .filter((p) => p.managerId === professional.id)
      .sort((a, b) => {
        const levelA = getHierarchyLevel(a.role || "");
        const levelB = getHierarchyLevel(b.role || "");
        if (levelA !== levelB) return levelA - levelB;
        return a.name.localeCompare(b.name);
      });

    const hasSubordinates = subordinates.length > 0;

    return (
      <div className="relative">
        {/* Linha vertical conectando ao líder (se não for o primeiro nível) */}
        {level > 0 && (
          <div className="absolute left-4 top-0 w-px h-4 bg-border" />
        )}

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start gap-1">
            {/* Botão para expandir/retrair */}
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
              <div
                draggable={canEditProfessionals ? true : false}
                onDragStart={() => handleDragStart(professional.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDropOnProfessional(professional.id);
                }}
                className={`
                  relative rounded-lg border bg-card p-2 shadow-sm cursor-move
                  transition-all hover:shadow-md hover:border-primary/40
                  ${draggedProfessionalId === professional.id ? "opacity-50" : ""}
                `}
              >
                <div className="flex items-center gap-2">
                  {canEditProfessionals && (
                    <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  
                  <Avatar className="h-8 w-8 border border-primary/40">
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
                  </div>

                  <div className="flex items-center gap-1">
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

                {/* Mostrar squads gerenciados se for perfil gestão */}
                {professional.profileType === "gestao" && professional.managedSquads && professional.managedSquads.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-border/50">
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
            </div>
          </div>

          {/* Subordinados */}
          {hasSubordinates && (
            <CollapsibleContent>
              <div className="ml-6 space-y-1 relative">
                {/* Linha vertical para os subordinados */}
                <div className="absolute left-4 top-0 bottom-2 w-px bg-border" />
                
                {subordinates.map((subordinate) => (
                  <div key={subordinate.id} className="relative">
                    {/* Linha horizontal conectando à linha vertical */}
                    <div className="absolute left-4 top-4 w-4 h-px bg-border" />
                    <HierarchyNode
                      professional={subordinate}
                      allProfessionals={allProfessionals}
                      level={level + 1}
                    />
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

  const handleDeleteProfessional = (professionalId: string) => {
    setProfessionals((previous) => previous.filter((professional) => professional.id !== professionalId));
    toast.success("Profissional removido do organograma.");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingProfessionalId) {
      const newProfessional: Professional = {
        id: createId(),
        ...formData,
      };
      setProfessionals((previous) => [...previous, newProfessional]);
      toast.success("Profissional adicionado ao organograma.");
    } else {
      setProfessionals((previous) =>
        previous.map((professional) =>
          professional.id === editingProfessionalId ? { ...professional, ...formData } : professional,
        ),
      );
      toast.success("Profissional atualizado no organograma.");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Organograma por Squad</h1>
            <p className="text-muted-foreground">
              Visualize a hierarquia, arraste e solte profissionais para reorganizar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedSquadId} onValueChange={setSelectedSquadId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione um squad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os squads</SelectItem>
                {squads
                  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
                  .map((squad) => (
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
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredGroups.map((group) => {
                // Encontra profissionais sem líder direto (raízes da hierarquia)
                const rootProfessionals = group.members
                  .filter((p) => !p.managerId || !group.members.find((m) => m.id === p.managerId))
                  .sort((a, b) => {
                    const levelA = getHierarchyLevel(a.role || "");
                    const levelB = getHierarchyLevel(b.role || "");
                    if (levelA !== levelB) return levelA - levelB;
                    return a.name.localeCompare(b.name);
                  });

                return (
                  <Card
                    key={group.metadata?.id ?? group.squadName}
                    className="border-border/60"
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnSquad(group.squadName);
                    }}
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users2 className="h-5 w-5 text-primary" />
                          <h2 className="text-xl font-semibold text-foreground">
                            {group.squadName}
                          </h2>
                          {group.metadata?.area && (
                            <Badge variant="outline" className="border-secondary/30 text-secondary">
                              {group.metadata.area}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-muted-foreground">
                          {group.members.length} {group.members.length === 1 ? "pessoa" : "pessoas"}
                        </Badge>
                      </div>

                      {group.members.length > 0 ? (
                        <div className="space-y-1">
                          {rootProfessionals.map((professional) => (
                            <HierarchyNode
                              key={professional.id}
                              professional={professional}
                              allProfessionals={group.members}
                              level={0}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Nenhum profissional alocado neste squad.
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                <Users2 className="h-14 w-14 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum squad encontrado para o filtro selecionado.</p>
              </Card>
            )}
          </div>
        </ScrollArea>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfessionalId ? "Editar profissional" : "Adicionar profissional"}</DialogTitle>
            <DialogDescription>
              Ajuste alocações ou cadastre novos profissionais diretamente no organograma.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organogram-name">Nome completo</Label>
                <Input
                  id="organogram-name"
                  placeholder="Nome e sobrenome"
                  value={formData.name}
                  onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organogram-email">E-mail</Label>
                <Input
                  id="organogram-email"
                  type="email"
                  placeholder="nome.sobrenome@wk.com.br"
                  value={formData.email}
                  onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organogram-role">Cargo / Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData((previous) => ({ ...previous, role: value }))}
                >
                  <SelectTrigger id="organogram-role">
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
                <Label htmlFor="organogram-squad">Squad Principal</Label>
                <Select
                  value={formData.squad}
                  onValueChange={(value) => setFormData((previous) => ({ ...previous, squad: value }))}
                >
                  <SelectTrigger id="organogram-squad">
                    <SelectValue placeholder="Selecione o squad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nenhum Squad">Nenhum Squad</SelectItem>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organogram-seniority">Senioridade</Label>
                <Select
                  value={formData.seniority}
                  onValueChange={(value) => setFormData((previous) => ({ ...previous, seniority: value }))}
                >
                  <SelectTrigger id="organogram-seniority">
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
                <Label htmlFor="organogram-profile">Perfil de atuação</Label>
                <Select
                  value={formData.profileType}
                  onValueChange={(value) =>
                    setFormData((previous) => ({ 
                      ...previous, 
                      profileType: value as Professional["profileType"],
                      managedSquads: value !== "gestao" ? [] : previous.managedSquads
                    }))
                  }
                >
                  <SelectTrigger id="organogram-profile">
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

            {/* Squads gerenciados - apenas para perfil gestão */}
            {formData.profileType === "gestao" && (
              <div className="space-y-2 p-4 border border-primary/20 rounded-lg bg-primary/5">
                <Label className="text-base font-semibold">Squads Gerenciados</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Selecione todos os squads que este profissional irá gerenciar
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {squadOptions.map((squadName) => (
                    <div key={squadName} className="flex items-center space-x-2">
                      <Checkbox
                        id={`squad-${squadName}`}
                        checked={formData.managedSquads?.includes(squadName)}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            managedSquads: checked
                              ? [...(prev.managedSquads || []), squadName]
                              : (prev.managedSquads || []).filter((s) => s !== squadName),
                          }));
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
              <Button type="submit">{editingProfessionalId ? "Salvar alterações" : "Adicionar Profissional"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
