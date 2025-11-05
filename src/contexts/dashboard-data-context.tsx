import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData, defaultDashboardData } from "@/lib/dashboard-data";

type DashboardDataContextValue = {
  data: DashboardData;
  isLoading: boolean;
  updateData: (data: DashboardData) => Promise<void>;
};

const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(
  undefined,
);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData>(defaultDashboardData);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: payload, error } = await supabase.rpc("get_dashboard_data");

      if (error) {
        console.error("Erro ao buscar dados do dashboard", error);
        setData(defaultDashboardData);
        return;
      }

      if (payload && typeof payload === "object") {
        setData(payload as DashboardData);
      } else {
        setData(defaultDashboardData);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const persistData = useCallback(async (updatedData: DashboardData) => {
    const { data: savedData, error } = await supabase.rpc("upsert_dashboard_data", {
      p_data: updatedData,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (savedData && typeof savedData === "object") {
      setData(savedData as DashboardData);
    } else {
      setData(updatedData);
    }
  }, []);

  const value = useMemo(
    () => ({
      data,
      isLoading,
      updateData: persistData,
    }),
    [data, isLoading, persistData],
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataProvider");
  }
  return context;
}
