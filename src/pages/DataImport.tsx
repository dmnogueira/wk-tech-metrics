import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualInputSection } from "@/components/data-import/ManualInputSection";
import { BulkImportSection } from "@/components/data-import/BulkImportSection";
import { DataConnectionsSection } from "@/components/data-import/DataConnectionsSection";
import { Upload, Database, Settings } from "lucide-react";

export default function DataImport() {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Dados e Importação</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie a entrada de dados dos indicadores: input manual, importação em lote ou automação
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="manual" className="gap-2">
              <Database className="h-4 w-4" />
              Input Manual
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2">
              <Upload className="h-4 w-4" />
              Importação em Lote
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-2">
              <Settings className="h-4 w-4" />
              Conexões de Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Input Manual de Dados</CardTitle>
                <CardDescription>
                  Insira valores individuais de indicadores para correções ou dados pontuais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ManualInputSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importação em Lote</CardTitle>
                <CardDescription>
                  Faça upload de arquivos CSV ou Excel com múltiplos valores de indicadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkImportSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conexões de Dados (Automação)</CardTitle>
                <CardDescription>
                  Configure integrações com APIs externas para sincronização automática de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataConnectionsSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
