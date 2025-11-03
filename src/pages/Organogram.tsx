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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Users2, UserCog } from "lucide-react";
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
  const [formData, setFormData] = useState<Omit<Professional, "id">>({
    name: "",
    email: "",
    role: "",
    squad: "",
    seniority: "Pleno",
    profileType: "colaborador",
    avatar: undefined,
  });

  const canEditProfessionals = hasPermission(["master", "admin", "gestao"]);

  const roleOptions = useMemo(() => jobRoles.map((role) => role.title), [jobRoles]);
  const squadOptions = useMemo(() => squads.map((squad) => squad.name), [squads]);

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

  const handleEditProfessional = (professional: Professional) => {
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
              Visualize a hierarquia dos squads, identifique responsáveis e ajuste alocações rapidamente.
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
                Adicionar profissional
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[70vh] rounded-md border border-border/60">
          <div className="p-6 space-y-6">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const manager = group.metadata?.managerId
                  ? professionals.find((professional) => professional.id === group.metadata?.managerId)
                  : null;

                return (
                  <Card key={group.metadata?.id ?? group.squadName} className="border-border/60">
                    <div className="p-6 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                            <Users2 className="h-5 w-5 text-primary" />
                            {group.squadName}
                          </h2>
                          {group.metadata?.area && (
                            <Badge variant="outline" className="mt-2 border-secondary/30 text-secondary">
                              {group.metadata.area}
                            </Badge>
                          )}
                        </div>

                        {manager && (
                          <div className="flex items-center gap-3 bg-muted/40 rounded-full px-4 py-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={manager.avatar} alt={manager.name} />
                              <AvatarFallback>
                                {manager.name
                                  .split(" ")
                                  .map((part) => part.charAt(0))
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{manager.name}</p>
                              <p className="text-xs text-muted-foreground">Gestão do squad</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <Tabs defaultValue="estrutura" className="w-full">
                        <TabsList className="w-full justify-start">
                          <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
                          <TabsTrigger value="detalhes">Detalhes do squad</TabsTrigger>
                        </TabsList>
                        <TabsContent value="estrutura" className="mt-4">
                          {group.members.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                              {group.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="relative rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-sm"
                                >
                                  <div className="flex items-start gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-primary/60">
                                      <AvatarImage src={member.avatar} alt={member.name} />
                                      <AvatarFallback>
                                        {member.name
                                          .split(" ")
                                          .map((part) => part.charAt(0))
                                          .join("")
                                          .toUpperCase()
                                          .slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-semibold text-foreground">{member.name}</p>
                                      <p className="text-sm text-muted-foreground">{member.role || "Função não definida"}</p>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="outline" className="border-info/40 text-info">
                                          {member.seniority}
                                        </Badge>
                                        <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                                          {member.profileType === "gestao"
                                            ? "Gestão"
                                            : member.profileType === "especialista"
                                              ? "Especialista"
                                              : member.profileType === "admin"
                                                ? "Admin"
                                                : "Colaborador"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {canEditProfessionals && (
                                    <div className="mt-4 flex items-center justify-end gap-2">
                                      <Button variant="ghost" size="icon" onClick={() => handleEditProfessional(member)}>
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteProfessional(member.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Nenhum profissional alocado neste squad.
                            </p>
                          )}
                        </TabsContent>

                        <TabsContent value="detalhes" className="mt-4">
                          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                            {group.metadata?.description || "Nenhuma descrição cadastrada para este squad."}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                );
              })
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
        <DialogContent>
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
                <Label htmlFor="organogram-squad">Squad</Label>
                <Select
                  value={formData.squad}
                  onValueChange={(value) => setFormData((previous) => ({ ...previous, squad: value }))}
                >
                  <SelectTrigger id="organogram-squad">
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
                    setFormData((previous) => ({ ...previous, profileType: value as Professional["profileType"] }))
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

            <div className="space-y-2">
              <Label htmlFor="organogram-avatar">URL da foto</Label>
              <Input
                id="organogram-avatar"
                placeholder="https://..."
                value={formData.avatar ?? ""}
                onChange={(event) => setFormData((previous) => ({ ...previous, avatar: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Insira uma URL segura (HTTPS) para utilizar a foto do profissional no organograma.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organogram-notes">Anotações</Label>
              <Textarea
                id="organogram-notes"
                placeholder="Detalhes adicionais sobre a atuação do profissional no squad."
                value={""}
                readOnly
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Área reservada para futuras integrações com feedbacks e anotações estruturais.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingProfessionalId ? "Salvar alterações" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
