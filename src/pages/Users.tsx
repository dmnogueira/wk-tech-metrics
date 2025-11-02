import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";

export default function Users() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários e permissões do sistema
            </p>
          </div>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <Card className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Nenhum usuário adicional cadastrado</p>
            <p className="text-sm">Clique em "Novo Usuário" para começar</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
