import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { KPICard } from "@/components/dashboard/KPICard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Bug, AlertTriangle, Users, TrendingUp, Target, Code, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("2025-09");
  const [selectedSquad, setSelectedSquad] = useState("all");
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);

  // Habilita render dos charts após o primeiro paint para evitar travamentos
  // e reduzir custo de renderização inicial
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setChartsReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Mock data para IR por Squad - memoizado para evitar re-renders
  const irData = useMemo(() => [
    { date: "01 Ago", Controladoria: 0.57, RH: 0.20, Empresarial: 0.20 },
    { date: "08 Ago", Controladoria: 0.65, RH: 0.22, Empresarial: 0.24 },
    { date: "15 Ago", Controladoria: 0.75, RH: 0.25, Empresarial: 0.26 },
    { date: "22 Ago", Controladoria: 0.85, RH: 0.28, Empresarial: 0.28 },
    { date: "01 Set", Controladoria: 1.00, RH: 0.30, Empresarial: 0.30 },
  ], []);

  // Mock data para Acompanhamento Mensal - memoizado
  const monthlyData = useMemo(() => [
    { month: "Jan", bugs: 120, issues: 45 },
    { month: "Fev", bugs: 115, issues: 50 },
    { month: "Mar", bugs: 108, issues: 42 },
    { month: "Abr", bugs: 125, issues: 38 },
    { month: "Mai", bugs: 95, issues: 55 },
    { month: "Jun", bugs: 130, issues: 48 },
    { month: "Jul", bugs: 85, issues: 52 },
    { month: "Ago", bugs: 98, issues: 45 },
    { month: "Set", bugs: 88, issues: 40 },
  ], []);

  // Mock data para Gestão de Crises - memoizado
  const crisisData = useMemo(() => [
    { month: "Jan", count: 6 },
    { month: "Fev", count: 4 },
    { month: "Mar", count: 9 },
    { month: "Abr", count: 3 },
    { month: "Mai", count: 15 },
    { month: "Jun", count: 2 },
    { month: "Jul", count: 3 },
    { month: "Ago", count: 2 },
    { month: "Set", count: 8 },
  ], []);

  // Mock data para Cards de Bug por Score - memoizado
  const bugScoreData = useMemo(() => [
    { month: "Jan", score0: 0, score1: 21, score2: 34, score3: 28, score4: 18 },
    { month: "Fev", score0: 0, score1: 26, score2: 38, score3: 30, score4: 22 },
    { month: "Mar", score0: 0, score1: 24, score2: 36, score3: 32, score4: 20 },
    { month: "Abr", score0: 0, score1: 28, score2: 40, score3: 34, score4: 24 },
    { month: "Mai", score0: 0, score1: 22, score2: 32, score3: 28, score4: 18 },
    { month: "Jun", score0: 0, score1: 30, score2: 48, score3: 38, score4: 28 },
    { month: "Jul", score0: 0, score1: 26, score2: 42, score3: 36, score4: 24 },
    { month: "Ago", score0: 0, score1: 28, score2: 44, score3: 38, score4: 26 },
    { month: "Set", score0: 0, score1: 24, score2: 40, score3: 34, score4: 22 },
  ], []);

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
              value={27}
              subtitle="26% do total em setembro"
              badge={{ label: "Crítico", variant: "destructive" }}
              trend={{ value: "Sem alteração", direction: "neutral" }}
              status="critical"
              icon={<AlertTriangle className="h-5 w-5" />}
            />

            <KPICard
              title="Retenção de Bugs"
              value="42%"
              subtitle="Agosto: 32%"
              badge={{ label: "Crítico", variant: "destructive" }}
              trend={{ value: "+10pp", direction: "up", isPositive: false }}
              status="critical"
            />

            <KPICard
              title="Bugs por Usuário"
              value="0,28"
              subtitle="2024: 0,31"
              badge={{ label: "KR", variant: "secondary" }}
              trend={{ value: "-9% YoY", direction: "down", isPositive: true }}
              goal="0,26"
              status="warning"
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
                  <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
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
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Controladoria" stroke="hsl(var(--chart-3))" strokeWidth={2} isAnimationActive={false} />
                  <Line type="monotone" dataKey="RH" stroke="hsl(var(--chart-1))" strokeWidth={2} isAnimationActive={false} />
                  <Line type="monotone" dataKey="Empresarial" stroke="hsl(var(--chart-2))" strokeWidth={2} isAnimationActive={false} />
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
                  <Bar dataKey="bugs" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="issues" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
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
              value="86%"
              subtitle="Meta: 85%"
              badge={{ label: "KR", variant: "secondary" }}
              trend={{ value: "+1%", direction: "up", isPositive: true }}
              goal="85%"
              progress={86}
              status="success"
              icon={<TrendingUp className="h-5 w-5" />}
            />

            <KPICard
              title="Backlog Refinado"
              value="98%"
              subtitle="Meta: 50%"
              badge={{ label: "KR", variant: "secondary" }}
              trend={{ value: "+48%", direction: "up", isPositive: true }}
              goal="50%"
              progress={98}
              status="success"
            />
          </div>
        </section>

        {/* Code Coverage */}
        <section>
          <KPICard
            title="Code Coverage APIs"
            value="99,77%"
            subtitle="Meta: 100%"
            badge={{ label: "Excelente", variant: "secondary", color: "success" }}
            trend={{ value: "-0,23%", direction: "down", isPositive: false }}
            goal="100%"
            progress={99.77}
            status="success"
            icon={<Code className="h-5 w-5" />}
          />
        </section>


        {/* Cards de Bug em Sustentação */}
        <section>
          <KPICard
            title="Cards de Bug em Sustentação"
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
              value="99,9%"
              subtitle="Meta: 99,9%"
              status="success"
              progress={100}
            />

            <KPICard
              title="MTTR"
              value="18 min"
              subtitle="Mean Time To Recovery"
              status="success"
            />

            <KPICard
              title="Iniciativas Técnicas"
              value="9,25%"
              subtitle="Meta: 7,5%"
              badge={{ label: "KR", variant: "secondary" }}
              trend={{ value: "+23%", direction: "up", isPositive: true }}
              goal="7,5%"
              progress={123}
              status="success"
            />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
