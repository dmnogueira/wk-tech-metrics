export type CrisisEntry = {
  month: string;
  count: number;
};

export type IRProjectsEntry = {
  month: string;
  values: Record<string, number>;
};

export type MonthlyTrackingEntry = {
  month: string;
  bugs: number;
  issues: number;
};

export type SupportBugEntry = {
  month: string;
  score0: number;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
};

export type DashboardCardData = {
  value: string;
  subtitle: string;
  goal?: string;
  trend?: string;
  progress?: number;
};

export type DashboardData = {
  cards: {
    criticalBugs: DashboardCardData;
    bugRetention: DashboardCardData;
    bugsPerUser: DashboardCardData & { goal: string; trend: string };
    efficiency: DashboardCardData & { goal: string; trend: string };
    refinedBacklog: DashboardCardData & { goal: string };
    codeCoverage: DashboardCardData & { goal: string; trend: string };
    availability: DashboardCardData;
    mttr: DashboardCardData;
    technicalInitiatives: DashboardCardData & { goal: string; trend: string };
  };
  charts: {
    crisisManagement: CrisisEntry[];
    irProjects: {
      squads: string[];
      data: IRProjectsEntry[];
    };
    monthlyTracking: MonthlyTrackingEntry[];
    supportBugs: SupportBugEntry[];
  };
};

export const defaultDashboardData: DashboardData = {
  cards: {
    criticalBugs: {
      value: "27",
      subtitle: "26% do total em setembro",
    },
    bugRetention: {
      value: "42%",
      subtitle: "Agosto: 32%",
    },
    bugsPerUser: {
      value: "0,28",
      subtitle: "2024: 0,31",
      goal: "0,26",
      trend: "-9% YoY",
    },
    efficiency: {
      value: "86%",
      subtitle: "Meta: 85%",
      goal: "85%",
      trend: "+1%",
      progress: 86,
    },
    refinedBacklog: {
      value: "98%",
      subtitle: "Meta: 50%",
      goal: "50%",
      progress: 98,
    },
    codeCoverage: {
      value: "99,77%",
      subtitle: "Meta: 100%",
      goal: "100%",
      trend: "-0,23%",
      progress: 99.77,
    },
    availability: {
      value: "99,9%",
      subtitle: "Meta: 99,9%",
      progress: 100,
    },
    mttr: {
      value: "18 min",
      subtitle: "Mean Time To Recovery",
    },
    technicalInitiatives: {
      value: "9,25%",
      subtitle: "Meta: 7,5%",
      goal: "7,5%",
      trend: "+23%",
      progress: 123,
    },
  },
  charts: {
    crisisManagement: [
      { month: "Jan", count: 6 },
      { month: "Fev", count: 4 },
      { month: "Mar", count: 9 },
      { month: "Abr", count: 3 },
      { month: "Mai", count: 15 },
      { month: "Jun", count: 2 },
      { month: "Jul", count: 3 },
      { month: "Ago", count: 2 },
      { month: "Set", count: 8 },
    ],
    irProjects: {
      squads: ["Controladoria", "RH", "Empresarial"],
      data: [
        {
          month: "01 Ago",
          values: {
            Controladoria: 0.57,
            RH: 0.2,
            Empresarial: 0.2,
          },
        },
        {
          month: "08 Ago",
          values: {
            Controladoria: 0.65,
            RH: 0.22,
            Empresarial: 0.24,
          },
        },
        {
          month: "15 Ago",
          values: {
            Controladoria: 0.75,
            RH: 0.25,
            Empresarial: 0.26,
          },
        },
        {
          month: "22 Ago",
          values: {
            Controladoria: 0.85,
            RH: 0.28,
            Empresarial: 0.28,
          },
        },
        {
          month: "01 Set",
          values: {
            Controladoria: 1,
            RH: 0.3,
            Empresarial: 0.3,
          },
        },
      ],
    },
    monthlyTracking: [
      { month: "Jan", bugs: 120, issues: 45 },
      { month: "Fev", bugs: 115, issues: 50 },
      { month: "Mar", bugs: 108, issues: 42 },
      { month: "Abr", bugs: 125, issues: 38 },
      { month: "Mai", bugs: 95, issues: 55 },
      { month: "Jun", bugs: 130, issues: 48 },
      { month: "Jul", bugs: 85, issues: 52 },
      { month: "Ago", bugs: 98, issues: 45 },
      { month: "Set", bugs: 88, issues: 40 },
    ],
    supportBugs: [
      { month: "Jan", score0: 0, score1: 21, score2: 34, score3: 28, score4: 18 },
      { month: "Fev", score0: 0, score1: 26, score2: 38, score3: 30, score4: 22 },
      { month: "Mar", score0: 0, score1: 24, score2: 36, score3: 32, score4: 20 },
      { month: "Abr", score0: 0, score1: 28, score2: 40, score3: 34, score4: 24 },
      { month: "Mai", score0: 0, score1: 22, score2: 32, score3: 28, score4: 18 },
      { month: "Jun", score0: 0, score1: 30, score2: 48, score3: 38, score4: 28 },
      { month: "Jul", score0: 0, score1: 26, score2: 42, score3: 36, score4: 24 },
      { month: "Ago", score0: 0, score1: 28, score2: 44, score3: 38, score4: 26 },
      { month: "Set", score0: 0, score1: 24, score2: 40, score3: 34, score4: 22 },
    ],
  },
};
