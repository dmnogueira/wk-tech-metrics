import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { KPICard } from "@/components/dashboard/KPICard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Bug, AlertTriangle, Users, TrendingUp, Target, Code, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/contexts/dashboard-data-context";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("2025-09");
  const [selectedSquad, setSelectedSquad] = useState("all");
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);
  const { data: dashboardData } = useDashboardData();

  // Habilita render dos charts após o primeiro paint para evitar travamentos
  // e reduzir custo de renderização inicial
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setChartsReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const { cards, charts, squadBugs = [] } = dashboardData;

  const { squads, data: irEntries } = charts.irProjects;

  const irData = useMemo(() => {
    return irEntries.map((entry) => ({
      month: entry.month,
      ...entry.values,
    }));
  }, [irEntries]);

  const crisisData = charts.crisisManagement;
  const monthlyData = charts.monthlyTracking;
  const bugScoreData = charts.supportBugs;
  const lastCrisisIndex = crisisData.length - 1;
  const lineColors = [
    "--chart-3",
    "--chart-1",
    "--chart-2",
    "--chart-4",
    "--chart-5",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard de Métricas Técnicas
          </h1>
          <p className="text-muted-foreground">
            Período: Setembro 2025
          </p>
        </div>

        <DashboardFilters
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedSquad={selectedSquad}
          onSquadChange={setSelectedSquad}
          compareWithPrevious={compareWithPrevious}
          onCompareToggle={() => setCompareWithPrevious(!compareWithPrevious)}
          overallStatus="attention"
        />

        {/* Seção de Qualidade */}
        <section>
          <SectionHeader title="Qualidade" icon={<Bug className="h-6 w-6" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="Bugs Críticos"
              value={cards.criticalBugs.value}
              subtitle={cards.criticalBugs.subtitle}
              status={cards.criticalBugs.status}
              monthComparison={cards.criticalBugs.monthComparison}
              isKR={cards.criticalBugs.isKR}
              icon={<AlertTriangle className="h-5 w-5" />}
            />

            <KPICard
              title="Retenção de Bugs"
              value={cards.bugRetention.value}
              subtitle={cards.bugRetention.subtitle}
              status={cards.bugRetention.status}
              monthComparison={cards.bugRetention.monthComparison}
              isKR={cards.bugRetention.isKR}
            />

            <KPICard
              title="Bugs por Usuário"
              value={cards.bugsPerUser.value}
              subtitle={cards.bugsPerUser.subtitle}
              trend={
                cards.bugsPerUser.trend
                  ? { value: cards.bugsPerUser.trend, direction: "down", isPositive: true }
                  : undefined
              }
              goal={cards.bugsPerUser.goal}
              status={cards.bugsPerUser.status}
              monthComparison={cards.bugsPerUser.monthComparison}
              isKR={cards.bugsPerUser.isKR}
              icon={<Users className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Gestão de Crises */}
        <section>
          <KPICard
            title="Gestão de Crises"
            value={8}
            subtitle="Ocorrências em setembro"
            titleClassName="text-lg font-semibold text-foreground"
            titleAdornment={
              <Badge
                variant="outline"
                className="border-warning/40 bg-warning/10 text-warning px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              >
                Monitoramento
              </Badge>
            }
            className="w-full"
          >
            {chartsReady ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={crisisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {crisisData.map((entry, index) => (
                      <Cell
                        key={`crisis-${entry.month}-${index}`}
                        fill={
                          index === lastCrisisIndex
                            ? "hsl(var(--chart-5))"
                            : "hsl(var(--chart-3))"
                        }
                      />
                    ))}
                    <LabelList dataKey="count" position="top" fill="hsl(var(--foreground))" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] rounded-md bg-muted/20" />
            )}
          </KPICard>
        </section>

        {/* IR em Projetos por Squad */}
        <section>
          <KPICard
            title="IR em Projetos por Squad"
            value=""
            subtitle="Indicador de Resposta aos Projetos"
            badge={{ label: "Atenção", variant: "secondary", color: "warning" }}
            className="w-full"
          >
            {chartsReady ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={irData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  {squads.map((squad, index) => (
                    <Line
                      key={squad}
                      type="monotone"
                      dataKey={squad}
                      stroke={`hsl(var(${lineColors[index % lineColors.length]}))`}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] rounded-md bg-muted/20" />
            )}
          </KPICard>
        </section>

        {/* Acompanhamento Mensal */}
        <section>
          <KPICard
            title="Acompanhamento Mensal"
            value=""
            subtitle="Bugs e Issues ao longo do tempo"
            className="w-full"
          >
            {chartsReady ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="bugs" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="bugs" position="top" fill="hsl(var(--foreground))" fontSize={12} />
                  </Bar>
                  <Bar dataKey="issues" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="issues" position="top" fill="hsl(var(--foreground))" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] rounded-md bg-muted/20" />
            )}
          </KPICard>
        </section>

        {/* Seção KR */}
        <section>
          <SectionHeader title="Key Results (KR)" badge="KR" icon={<Target className="h-6 w-6" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KPICard
              title="Eficiência"
              value={cards.efficiency.value}
              subtitle={cards.efficiency.subtitle}
              badge={{ label: "KR", variant: "secondary" }}
              trend={
                cards.efficiency.trend
                  ? { value: cards.efficiency.trend, direction: "up", isPositive: true }
                  : undefined
              }
              goal={cards.efficiency.goal}
              progress={cards.efficiency.progress}
              status="success"
              icon={<TrendingUp className="h-5 w-5" />}
            />

            <KPICard
              title="Backlog Refinado"
              value={cards.refinedBacklog.value}
              subtitle={cards.refinedBacklog.subtitle}
              badge={{ label: "KR", variant: "secondary" }}
              goal={cards.refinedBacklog.goal}
              progress={cards.refinedBacklog.progress}
              status="success"
            />
          </div>
        </section>

        {/* Code Coverage */}
        <section>
          <KPICard
            title="Code Coverage APIs"
            value={cards.codeCoverage.value}
            subtitle={cards.codeCoverage.subtitle}
            badge={{ label: "Excelente", variant: "secondary", color: "success" }}
            trend={
              cards.codeCoverage.trend
                ? { value: cards.codeCoverage.trend, direction: "down", isPositive: false }
                : undefined
            }
            goal={cards.codeCoverage.goal}
            progress={cards.codeCoverage.progress}
            status="success"
            icon={<Code className="h-5 w-5" />}
          />
        </section>


        {/* Bugs em Sustentação por Squad */}
        <section>
          <SectionHeader title="Bugs em Sustentação por Squad" icon={<Bug className="h-6 w-6" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {squadBugs.map((squad) => (
              <KPICard
                key={squad.squad}
                title={squad.squad}
                value={squad.currentMonth}
                subtitle={`Mês anterior: ${squad.previousMonth}`}
                status={squad.status}
                monthComparison={squad.trend}
                icon={<Bug className="h-5 w-5" />}
              />
            ))}
          </div>
        </section>

        {/* Score de Bugs em Suporte */}
        <section>
          <KPICard
            title="Score de Bugs em Suporte"
            value=""
            subtitle="Distribuição por score de severidade"
            badge={{ label: "Melhoria", variant: "secondary", color: "warning" }}
            className="w-full"
          >
            {chartsReady ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bugScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="score1" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="score2" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="score3" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="score4" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] rounded-md bg-muted/20" />
            )}
          </KPICard>
        </section>

        {/* Métricas SRE */}
        <section>
          <SectionHeader title="SRE & Disponibilidade" icon={<Activity className="h-6 w-6" />} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard
              title="Disponibilidade"
              value={cards.availability.value}
              subtitle={cards.availability.subtitle}
              status="success"
              progress={cards.availability.progress}
            />

            <KPICard
              title="MTTR"
              value={cards.mttr.value}
              subtitle={cards.mttr.subtitle}
              status="success"
            />

            <KPICard
              title="Iniciativas Técnicas"
              value={cards.technicalInitiatives.value}
              subtitle={cards.technicalInitiatives.subtitle}
              badge={{ label: "KR", variant: "secondary" }}
              trend={
                cards.technicalInitiatives.trend
                  ? { value: cards.technicalInitiatives.trend, direction: "up", isPositive: true }
                  : undefined
              }
              goal={cards.technicalInitiatives.goal}
              progress={cards.technicalInitiatives.progress}
              status="success"
            />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
