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

  const isSchemaCacheError = (message?: string | null) =>
    message?.toLowerCase()?.includes("schema cache") ?? false;

  const fetchFromEdgeFunction = useCallback(async () => {
    const { data: response, error } = await supabase.functions.invoke<{
      data?: unknown;
    }>("dashboard-data", {
      method: "GET",
    });

    if (error) {
      console.error("Erro ao buscar dados do dashboard via função", error);
      return null;
    }

    if (response && typeof response === "object" && "data" in response) {
      return (response.data as DashboardData) ?? defaultDashboardData;
    }

    return defaultDashboardData;
  }, []);

  const fetchFromTable = useCallback(async () => {
    const { data: rows, error: fallbackError } = await supabase
      .from("dashboard_data")
      .select("data")
      .eq("id", "dashboard-config")
      .maybeSingle();

    if (fallbackError) {
      console.error("Erro ao buscar dados do dashboard", fallbackError);
      return null;
    }

    return (rows?.data as DashboardData) ?? defaultDashboardData;
  }, []);

  const upsertViaEdgeFunction = useCallback(
    async (updatedData: DashboardData) => {
      const { data: response, error } = await supabase.functions.invoke<{
        data?: unknown;
      }>("dashboard-data", {
        method: "PUT",
        body: { data: updatedData },
      });

      if (error) {
        console.error("Erro ao salvar dados do dashboard via função", error);
        return null;
      }

      if (response && typeof response === "object" && "data" in response) {
        return (response.data as DashboardData) ?? updatedData;
      }

      return updatedData;
    },
    [],
  );

  const upsertViaTable = useCallback(async (updatedData: DashboardData) => {
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
      console.error("Erro ao salvar dados do dashboard", fallbackError);
      return null;
    }

    return (fallbackRows?.data as DashboardData) ?? updatedData;
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: payload, error } = await supabase.rpc("get_dashboard_data");

      if (error) {
        if (
          error.message?.includes("get_dashboard_data") ||
          isSchemaCacheError(error.message)
        ) {
          const edgeData = await fetchFromEdgeFunction();
          if (edgeData) {
            setData(edgeData);
            return;
          }

          const tableData = await fetchFromTable();
          if (tableData) {
            setData(tableData);
            return;
          }
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
  }, [fetchFromEdgeFunction, fetchFromTable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const persistData = useCallback(async (updatedData: DashboardData) => {
    const { data: savedData, error } = await supabase.rpc(
      "upsert_dashboard_data",
      {
        p_data: updatedData,
      },
    );

    if (error) {
      if (
        error.message?.includes("upsert_dashboard_data") ||
        isSchemaCacheError(error.message)
      ) {
        const edgeData = await upsertViaEdgeFunction(updatedData);
        if (edgeData) {
          setData(edgeData);
          return;
        }

        const tableData = await upsertViaTable(updatedData);
        if (tableData) {
          setData(tableData);
          return;
        }
      }

      throw new Error(error.message);
    }

    if (savedData && typeof savedData === "object") {
      setData(savedData as DashboardData);
    } else {
      setData(updatedData);
    }
  }, [upsertViaEdgeFunction, upsertViaTable]);

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
