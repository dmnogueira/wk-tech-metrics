import { Indicator, IndicatorValue } from "@/types/indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndicatorWidgetProps {
  indicator: Indicator;
  value?: IndicatorValue | null;
  compareWithPrevious?: boolean;
}

export function IndicatorWidget({ indicator, value, compareWithPrevious }: IndicatorWidgetProps) {
  // Determinar a cor da borda baseado no status
  const getBorderColor = (status: string) => {
    switch (status) {
      case "critical":
        return "border-l-destructive";
      case "warning":
        return "border-l-warning";
      case "excellent":
        return "border-l-success";
      default:
        return "border-l-muted";
    }
  };

  // Calcular percentual de comparação
  const comparisonPercentage = value?.comparison_percentage;
  const hasComparison = compareWithPrevious && comparisonPercentage !== undefined && comparisonPercentage !== null;

  // Determinar se a tendência é positiva ou negativa
  const isPositiveTrend = comparisonPercentage && comparisonPercentage > 0;
  const isNegativeTrend = comparisonPercentage && comparisonPercentage < 0;

  return (
    <Card className={cn("border-l-4 wk-clean", getBorderColor(value?.status || "neutral"))}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {indicator.acronym}
              </Badge>
              {indicator.is_kr && (
                <Badge variant="secondary" className="text-xs">
                  KR
                </Badge>
              )}
            </div>
            <CardTitle className="text-base font-semibold leading-tight">
              {indicator.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Valor Principal */}
        {value ? (
          <div>
            <div className="text-3xl font-bold text-foreground">
              {value.value !== undefined && value.value !== null 
                ? value.value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })
                : value.text_value || "—"}
            </div>
            {value.value !== undefined && indicator.suggested_target && (
              <p className="text-xs text-muted-foreground mt-1">
                Meta: {indicator.suggested_target}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Sem dados</span>
          </div>
        )}

        {/* Comparação com período anterior */}
        {hasComparison && (
          <div className="flex items-center gap-2 text-sm">
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : isNegativeTrend ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn(
              "font-medium",
              isPositiveTrend && "text-success",
              isNegativeTrend && "text-destructive"
            )}>
              {comparisonPercentage > 0 ? "+" : ""}{comparisonPercentage.toFixed(1)}%
            </span>
            <span className="text-muted-foreground text-xs">vs. anterior</span>
          </div>
        )}

        {/* Status Badge */}
        {value?.status && value.status !== "neutral" && (
          <div>
            <Badge
              variant={
                value.status === "critical" ? "destructive" :
                value.status === "warning" ? "secondary" :
                "default"
              }
              className={cn(
                "text-xs",
                value.status === "warning" && "bg-warning/10 text-warning border-warning/40",
                value.status === "excellent" && "bg-success/10 text-success border-success/40"
              )}
            >
              {value.status === "critical" && "Crítico"}
              {value.status === "warning" && "Atenção"}
              {value.status === "excellent" && "Excelente"}
            </Badge>
          </div>
        )}

        {/* Segmentação */}
        {(value?.product_name || indicator.segmentation) && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {value?.product_name && (
              <div>Produto: {value.product_name}</div>
            )}
            {indicator.segmentation && !value?.product_name && (
              <div>Segmentação: {indicator.segmentation}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
