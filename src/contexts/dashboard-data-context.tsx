import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData, defaultDashboardData } from "@/lib/dashboard-data";
import { TablesInsert } from "@/integrations/supabase/types";

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
        // Se a função RPC ainda não estiver disponível no PostgREST, usa o fallback direto na tabela
        if (
          error.message?.includes("get_dashboard_data") ||
          error.message?.includes("schema cache")
        ) {
          const { data: rows, error: fallbackError } = await supabase
            .from("dashboard_data")
            .select("data")
            .eq("id", "dashboard-config")
            .maybeSingle();

          if (fallbackError) {
            console.error("Erro ao buscar dados do dashboard", fallbackError);
            setData(defaultDashboardData);
            return;
          }

          setData((rows?.data as DashboardData) ?? defaultDashboardData);
          return;
        }

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
      if (
        error.message?.includes("upsert_dashboard_data") ||
        error.message?.includes("schema cache")
      ) {
        const payload: TablesInsert<"dashboard_data"> = {
          id: "dashboard-config",
          data: updatedData,
        };

        const { data: fallbackRows, error: fallbackError } = await supabase
          .from("dashboard_data")
          .upsert(payload, { onConflict: "id" })
          .select("data")
          .single();

        if (fallbackError) {
          throw new Error(fallbackError.message);
        }

        setData((fallbackRows?.data as DashboardData) ?? updatedData);
        return;
      }

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
