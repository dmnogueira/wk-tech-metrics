import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Squad {
  id: number;
  name: string;
  area: string;
  description: string;
}

export default function Squads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Squad, "id">>({
    name: "",
    area: "",
    description: "",
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Informe o nome do squad.");
      return;
    }

    const newSquad: Squad = {
      id: Date.now(),
      ...formData,
    };

    setSquads((previous) => [...previous, newSquad]);
    setFormData({ name: "", area: "", description: "" });
    setIsDialogOpen(false);
    toast.success("Squad criado com sucesso!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Squads</h1>
            <p className="text-muted-foreground">Gerencie os squads e suas configurações</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Squad
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar novo squad</DialogTitle>
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
                  <Button type="submit">Salvar Squad</Button>
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
                  <TableHead>Descrição</TableHead>
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
                    <TableCell className="text-muted-foreground">
                      {squad.description || "Sem descrição cadastrada."}
                    </TableCell>
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
      </div>
    </DashboardLayout>
  );
}
