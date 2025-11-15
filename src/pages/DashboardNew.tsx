import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { IndicatorWidget } from "@/components/dashboard/IndicatorWidget";
import { useIndicators } from "@/hooks/use-indicators";
import { useIndicatorValues } from "@/hooks/use-indicator-values";
import { Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function DashboardNew() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedSquad, setSelectedSquad] = useState("all");
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);

  // Buscar apenas indicadores ativos
  const { data: indicators, isLoading: loadingIndicators } = useIndicators(true);

  // Buscar valores dos indicadores do mês selecionado
  const periodStart = format(startOfMonth(new Date(selectedMonth + "-01")), "yyyy-MM-dd");
  const periodEnd = format(endOfMonth(new Date(selectedMonth + "-01")), "yyyy-MM-dd");

  const { data: values, isLoading: loadingValues } = useIndicatorValues({
    periodStart,
    periodEnd,
    squadId: selectedSquad !== "all" ? selectedSquad : undefined,
  });

  // Agrupar indicadores por categoria
  const categorizedIndicators = useMemo(() => {
    if (!indicators) return {};

    const grouped: Record<string, typeof indicators> = {};

    indicators.forEach((indicator) => {
      const category = indicator.category || "Outros";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(indicator);
    });

    // Ordenar indicadores dentro de cada categoria por prioridade
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => b.priority - a.priority);
    });

    return grouped;
  }, [indicators]);

  // Mapear valores aos indicadores
  const indicatorsWithValues = useMemo(() => {
    if (!indicators || !values) return {};

    const mapped: Record<string, any> = {};

    indicators.forEach((indicator) => {
      const indicatorValues = values.filter((v) => v.indicator_id === indicator.id);
      mapped[indicator.id] = {
        indicator,
        values: indicatorValues,
        latestValue: indicatorValues.length > 0 ? indicatorValues[0] : null,
      };
    });

    return mapped;
  }, [indicators, values]);

  const isLoading = loadingIndicators || loadingValues;

  // Determinar status geral do dashboard
  const overallStatus = useMemo(() => {
    if (!values || values.length === 0) return "neutral";

    const statusCounts = {
      critical: 0,
      warning: 0,
      excellent: 0,
      neutral: 0,
    };

    values.forEach((value) => {
      statusCounts[value.status] = (statusCounts[value.status] || 0) + 1;
    });

    if (statusCounts.critical > 0) return "critical";
    if (statusCounts.warning > 2) return "attention";
    if (statusCounts.excellent > statusCounts.warning) return "success";
    return "neutral";
  }, [values]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const categories = Object.keys(categorizedIndicators).sort();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 logo-text">
            WK.metrics
          </h1>
          <p className="text-muted-foreground">
            Sistema de Métricas Técnicas - {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
          </p>
        </div>

        {/* Filtros */}
        <DashboardFilters
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedSquad={selectedSquad}
          onSquadChange={setSelectedSquad}
          compareWithPrevious={compareWithPrevious}
          onCompareToggle={() => setCompareWithPrevious(!compareWithPrevious)}
          overallStatus={overallStatus}
        />

        {/* Indicadores sem categoria ou sem valores */}
        {categories.length === 0 && (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum indicador ativo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure indicadores na área administrativa para começar a visualizar métricas
            </p>
          </div>
        )}

        {/* Renderizar seções dinamicamente baseado nas categorias */}
        {categories.map((category) => {
          const categoryIndicators = categorizedIndicators[category];

          return (
            <section key={category}>
              <SectionHeader title={category} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryIndicators.map((indicator) => {
                  const data = indicatorsWithValues[indicator.id];
                  return (
                    <IndicatorWidget
                      key={indicator.id}
                      indicator={indicator}
                      value={data?.latestValue}
                      compareWithPrevious={compareWithPrevious}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Mensagem se não há dados para o período */}
        {categories.length > 0 && values?.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
            <p className="text-muted-foreground">
              Não há dados registrados para o período selecionado.
              <br />
              <span className="text-sm">
                Use a área de <strong>Gestão de Dados</strong> para importar valores.
              </span>
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
