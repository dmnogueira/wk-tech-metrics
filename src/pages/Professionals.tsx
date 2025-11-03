import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Professional {
  id: number;
  name: string;
  email: string;
  role: string;
  squad: string;
  seniority: string;
}

export default function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Professional, "id">>({
    name: "",
    email: "",
    role: "",
    squad: "",
    seniority: "Pleno",
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Informe nome e e-mail do profissional.");
      return;
    }

    const newProfessional: Professional = {
      id: Date.now(),
      ...formData,
    };

    setProfessionals((previous) => [...previous, newProfessional]);
    setFormData({ name: "", email: "", role: "", squad: "", seniority: "Pleno" });
    setIsDialogOpen(false);
    toast.success("Profissional cadastrado com sucesso!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Profissionais</h1>
            <p className="text-muted-foreground">Gerencie profissionais e suas associações</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Profissional
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar profissional</DialogTitle>
                <DialogDescription>
                  Registre membros de squads para acompanhar performance e alocação.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Input
                      id="professional-role"
                      placeholder="Ex: Engenheiro de Software"
                      value={formData.role}
                      onChange={(event) =>
                        setFormData((previous) => ({ ...previous, role: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professional-squad">Squad</Label>
                    <Input
                      id="professional-squad"
                      placeholder="Ex: Controladoria"
                      value={formData.squad}
                      onChange={(event) =>
                        setFormData((previous) => ({ ...previous, squad: event.target.value }))
                      }
                    />
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

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Profissional</Button>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Squad</TableHead>
                  <TableHead className="text-right">Senioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((professional) => (
                  <TableRow key={professional.id}>
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
                      {professional.squad ? (
                        professional.squad
                      ) : (
                        <span className="text-muted-foreground text-sm">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="border-info/30 bg-info/10 text-info" variant="outline">
                        {professional.seniority}
                      </Badge>
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
      </div>
    </DashboardLayout>
  );
}
