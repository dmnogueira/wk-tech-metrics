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
        <div className="flex items-center justify-center h-96 bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-foreground font-medium">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const categories = Object.keys(categorizedIndicators).sort();
  const hasIndicators = indicators && indicators.length > 0;
  const hasValues = values && values.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 min-h-screen bg-background p-6">
        {/* Header */}
        <div className="bg-card border rounded-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 logo-text">
            WK.metrics
          </h1>
          <p className="text-muted-foreground">
            Sistema de Métricas Técnicas - {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
          </p>
          
          {/* Debug info */}
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <p>✅ Indicadores cadastrados: {indicators?.length || 0}</p>
            <p>📊 Valores no período: {values?.length || 0}</p>
            <p>📂 Categorias: {categories.length}</p>
          </div>
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

        {/* Mensagem quando não há indicadores */}
        {!hasIndicators && (
          <div className="border-2 border-dashed rounded-lg p-12 text-center bg-card">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Nenhum indicador ativo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure indicadores na área administrativa para começar a visualizar métricas
            </p>
          </div>
        )}

        {/* Mensagem quando há indicadores mas sem valores */}
        {hasIndicators && !hasValues && (
          <div className="border-2 border-dashed rounded-lg p-12 text-center bg-card">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Dashboard Configurado com Sucesso! 🎉
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você tem <strong className="text-foreground">{indicators?.length} indicadores</strong> cadastrados,
              mas ainda não há dados históricos para exibir.
            </p>
            <div className="space-y-2 text-sm text-left max-w-md mx-auto bg-muted/50 p-4 rounded-lg">
              <p className="font-medium text-foreground">📋 Próximos passos:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Acesse <strong className="text-foreground">Indicadores Técnicos</strong> para ver os {indicators?.length} indicadores</li>
                <li>Use <strong className="text-foreground">Importação de Dados</strong> para adicionar valores históricos</li>
                <li>Configure conexões com Azure DevOps para automação</li>
              </ul>
            </div>
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


      </div>
    </DashboardLayout>
  );
}
