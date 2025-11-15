import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIndicators } from "@/hooks/use-indicators";
import { useSquads } from "@/hooks/use-squads";
import { useCreateIndicatorValue } from "@/hooks/use-indicator-values";
import { IndicatorValueFormData } from "@/types/indicators";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ManualInputSection() {
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<Date>();
  const [periodEnd, setPeriodEnd] = useState<Date>();

  const { data: indicators } = useIndicators(true); // Only active indicators
  const { data: squads } = useSquads();
  const createValue = useCreateIndicatorValue();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IndicatorValueFormData>({
    defaultValues: {
      period_type: "mensal",
      source: "manual",
      status: "neutral",
    },
  });

  const periodType = watch("period_type");

  const onSubmit = async (data: IndicatorValueFormData) => {
    if (!periodStart || !periodEnd) {
      return;
    }

    const valueData: IndicatorValueFormData = {
      ...data,
      indicator_id: selectedIndicator,
      period_start: format(periodStart, "yyyy-MM-dd"),
      period_end: format(periodEnd, "yyyy-MM-dd"),
      value: data.value ? Number(data.value) : undefined,
    };

    await createValue.mutateAsync(valueData);
    reset();
    setSelectedIndicator("");
    setPeriodStart(undefined);
    setPeriodEnd(undefined);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Indicador */}
        <div className="space-y-2">
          <Label htmlFor="indicator">Indicador *</Label>
          <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um indicador" />
            </SelectTrigger>
            <SelectContent>
              {indicators?.map((indicator) => (
                <SelectItem key={indicator.id} value={indicator.id}>
                  {indicator.acronym} - {indicator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Período */}
        <div className="space-y-2">
          <Label htmlFor="period_type">Tipo de Período *</Label>
          <Select
            value={periodType}
            onValueChange={(value) => setValue("period_type", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sprint">Sprint</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Data Início */}
        <div className="space-y-2">
          <Label>Data Início do Período *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !periodStart && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {periodStart ? format(periodStart, "dd/MM/yyyy") : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={periodStart}
                onSelect={setPeriodStart}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data Fim */}
        <div className="space-y-2">
          <Label>Data Fim do Período *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !periodEnd && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {periodEnd ? format(periodEnd, "dd/MM/yyyy") : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={periodEnd}
                onSelect={setPeriodEnd}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Squad */}
        <div className="space-y-2">
          <Label htmlFor="squad_id">Squad</Label>
          <Select onValueChange={(value) => setValue("squad_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma squad (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {squads?.map((squad) => (
                <SelectItem key={squad.id} value={squad.id}>
                  {squad.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Produto */}
        <div className="space-y-2">
          <Label htmlFor="product_name">Nome do Produto</Label>
          <Input
            id="product_name"
            {...register("product_name")}
            placeholder="Ex: WK.app"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Valor */}
        <div className="space-y-2">
          <Label htmlFor="value">Valor Numérico</Label>
          <Input
            id="value"
            type="number"
            step="any"
            {...register("value")}
            placeholder="Ex: 4.5"
          />
        </div>

        {/* Valor Texto */}
        <div className="space-y-2">
          <Label htmlFor="text_value">Valor Texto</Label>
          <Input
            id="text_value"
            {...register("text_value")}
            placeholder="Para indicadores não numéricos"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue="neutral"
            onValueChange={(value) => setValue("status", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="warning">Atenção</SelectItem>
              <SelectItem value="excellent">Excelente</SelectItem>
              <SelectItem value="neutral">Neutro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Valor de Comparação */}
        <div className="space-y-2">
          <Label htmlFor="comparison_value">Valor de Comparação</Label>
          <Input
            id="comparison_value"
            type="number"
            step="any"
            {...register("comparison_value")}
            placeholder="Valor anterior para comparação"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={!selectedIndicator || !periodStart || !periodEnd}>
          Salvar Dado
        </Button>
      </div>
    </form>
  );
}
