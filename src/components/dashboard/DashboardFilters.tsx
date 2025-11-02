import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardFiltersProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedSquad: string;
  onSquadChange: (squad: string) => void;
  compareWithPrevious: boolean;
  onCompareToggle: () => void;
  overallStatus: "ok" | "attention" | "critical";
}

const statusConfig = {
  ok: {
    label: "OK",
    variant: "success" as const,
    className: "bg-success text-success-foreground",
  },
  attention: {
    label: "Atenção",
    variant: "warning" as const,
    className: "bg-warning text-warning-foreground",
  },
  critical: {
    label: "Crítico",
    variant: "destructive" as const,
    className: "bg-destructive text-destructive-foreground",
  },
};

export function DashboardFilters({
  selectedMonth,
  onMonthChange,
  selectedSquad,
  onSquadChange,
  compareWithPrevious,
  onCompareToggle,
  overallStatus,
}: DashboardFiltersProps) {
  const months = [
    { value: "2025-09", label: "Setembro 2025" },
    { value: "2025-08", label: "Agosto 2025" },
    { value: "2025-07", label: "Julho 2025" },
    { value: "2025-06", label: "Junho 2025" },
  ];

  const squads = [
    { value: "all", label: "Todos os Squads" },
    { value: "controladoria", label: "Controladoria" },
    { value: "rh", label: "RH" },
    { value: "empresarial", label: "Empresarial" },
  ];

  return (
    <div className="bg-card rounded-lg border border-border/50 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Select value={selectedSquad} onValueChange={onSquadChange}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Todos os Squads" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {squads.map((squad) => (
                  <SelectItem key={squad.value} value={squad.value}>
                    {squad.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant={compareWithPrevious ? "secondary" : "outline"}
            size="default"
            onClick={onCompareToggle}
            className="w-full sm:w-auto"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Comparar
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status Geral:</span>
          <Badge className={statusConfig[overallStatus].className}>
            {statusConfig[overallStatus].label}
          </Badge>
        </div>
      </div>
    </div>
  );
}
