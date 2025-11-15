import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateIndicator, useUpdateIndicator } from "@/hooks/use-indicators";
import { Indicator, IndicatorFormData } from "@/types/indicators";

interface IndicatorFormProps {
  indicator?: Indicator | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IndicatorForm({ indicator, onSuccess, onCancel }: IndicatorFormProps) {
  const createIndicator = useCreateIndicator();
  const updateIndicator = useUpdateIndicator();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IndicatorFormData>({
    defaultValues: indicator
      ? {
          is_active: indicator.is_active,
          is_kr: indicator.is_kr,
          priority: indicator.priority,
          name: indicator.name,
          acronym: indicator.acronym,
          type: indicator.type || undefined,
          category: indicator.category,
          description: indicator.description || "",
          objective: indicator.objective || "",
          calculation_formula: indicator.calculation_formula || "",
          action_when_bad: indicator.action_when_bad || "",
          result_when_good: indicator.result_when_good || "",
          suggested_target: indicator.suggested_target || "",
          default_granularity: indicator.default_granularity || "",
          segmentation: indicator.segmentation || "",
          azure_devops_source: indicator.azure_devops_source || "",
          base_query: indicator.base_query || "",
        }
      : {
          is_active: true,
          is_kr: false,
          priority: 0,
          name: "",
          acronym: "",
          category: "",
          description: "",
          objective: "",
          calculation_formula: "",
          action_when_bad: "",
          result_when_good: "",
          suggested_target: "",
          default_granularity: "Mensal",
          segmentation: "Por Squad",
          azure_devops_source: "",
          base_query: "",
        },
  });

  const isActive = watch("is_active");
  const isKr = watch("is_kr");

  const onSubmit = async (data: IndicatorFormData) => {
    try {
      if (indicator) {
        await updateIndicator.mutateAsync({ id: indicator.id, data });
      } else {
        await createIndicator.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving indicator:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="integration">Integração</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Controles de exibição */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
                id="is_active"
              />
              <Label htmlFor="is_active">Ativo no Dashboard</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isKr}
                onCheckedChange={(checked) => setValue("is_kr", checked)}
                id="is_kr"
              />
              <Label htmlFor="is_kr">É um KR?</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                type="number"
                {...register("priority", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Informações básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Indicador *</Label>
              <Input
                id="name"
                {...register("name", { required: "Nome é obrigatório" })}
                placeholder="Ex: Lead Time"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="acronym">Sigla *</Label>
              <Input
                id="acronym"
                {...register("acronym", { required: "Sigla é obrigatória" })}
                placeholder="Ex: LT"
              />
              {errors.acronym && (
                <p className="text-sm text-destructive">{errors.acronym.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={watch("type") || ""}
                onValueChange={(value) => setValue("type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upstream">Upstream</SelectItem>
                  <SelectItem value="Downstream">Downstream</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Input
                id="category"
                {...register("category", { required: "Categoria é obrigatória" })}
                placeholder="Ex: Fluxo/Entrega, Qualidade, DevOps/DORA"
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_granularity">Granularidade Padrão</Label>
              <Input
                id="default_granularity"
                {...register("default_granularity")}
                placeholder="Ex: Sprint, Mensal, Trimestral"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segmentation">Segmentação</Label>
              <Input
                id="segmentation"
                {...register("segmentation")}
                placeholder="Ex: Por Squad, Por Produto"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Objetivo</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva o objetivo deste indicador..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calculation_formula">Memória de Cálculo (Fórmula)</Label>
            <Textarea
              id="calculation_formula"
              {...register("calculation_formula")}
              placeholder="Descreva como este indicador é calculado..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggested_target">Meta Sugerida</Label>
            <Input
              id="suggested_target"
              {...register("suggested_target")}
              placeholder="Ex: < 5 dias, baseline 10% → alvo 5%"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result_when_good">Quando a métrica está boa (resultado esperado)</Label>
            <Textarea
              id="result_when_good"
              {...register("result_when_good")}
              placeholder="Descreva o que significa um resultado bom..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action_when_bad">Ação quando a métrica estiver ruim</Label>
            <Textarea
              id="action_when_bad"
              {...register("action_when_bad")}
              placeholder="Descreva as ações a serem tomadas quando o resultado for ruim..."
              rows={2}
            />
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="azure_devops_source">Fonte no Azure DevOps</Label>
            <Input
              id="azure_devops_source"
              {...register("azure_devops_source")}
              placeholder="Ex: Work Items, Releases, Boards"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_query">Consulta Base (WIQL / OData)</Label>
            <Textarea
              id="base_query"
              {...register("base_query")}
              placeholder="Cole a query WIQL ou OData para este indicador..."
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Esta query será usada como referência para configurar a integração automática
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {indicator ? "Salvar Alterações" : "Criar Indicador"}
        </Button>
      </div>
    </form>
  );
}
