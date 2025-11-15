import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IndicatorValue, IndicatorValueFormData } from "@/types/indicators";
import { toast } from "@/hooks/use-toast";

export function useIndicatorValues(filters?: {
  indicatorId?: string;
  squadId?: string;
  periodStart?: string;
  periodEnd?: string;
}) {
  return useQuery({
    queryKey: ["indicator-values", filters],
    queryFn: async () => {
      let query = supabase
        .from("indicator_values")
        .select(`
          *,
          indicator:indicators(*)
        `)
        .order("period_start", { ascending: false });

      if (filters?.indicatorId) {
        query = query.eq("indicator_id", filters.indicatorId);
      }
      if (filters?.squadId) {
        query = query.eq("squad_id", filters.squadId);
      }
      if (filters?.periodStart) {
        query = query.gte("period_start", filters.periodStart);
      }
      if (filters?.periodEnd) {
        query = query.lte("period_end", filters.periodEnd);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as IndicatorValue[];
    },
  });
}

export function useCreateIndicatorValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: IndicatorValueFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("indicator_values")
        .insert({
          ...value,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicator-values"] });
      toast({
        title: "Valor registrado",
        description: "O valor do indicador foi registrado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar valor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateIndicatorValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IndicatorValueFormData> }) => {
      const { data: updated, error } = await supabase
        .from("indicator_values")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicator-values"] });
      toast({
        title: "Valor atualizado",
        description: "O valor do indicador foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar valor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBulkCreateIndicatorValues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: IndicatorValueFormData[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const valuesToInsert = values.map(v => ({
        ...v,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from("indicator_values")
        .insert(valuesToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["indicator-values"] });
      toast({
        title: "Importação concluída",
        description: `${data.length} valores foram importados com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
