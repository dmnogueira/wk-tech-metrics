import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Indicator, IndicatorFormData } from "@/types/indicators";
import { toast } from "@/hooks/use-toast";

export function useIndicators(activeOnly: boolean = false) {
  return useQuery({
    queryKey: ["indicators", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("indicators")
        .select("*")
        .order("priority", { ascending: false })
        .order("name", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Indicator[];
    },
  });
}

export function useIndicator(id: string | undefined) {
  return useQuery({
    queryKey: ["indicator", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("indicators")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Indicator;
    },
    enabled: !!id,
  });
}

export function useCreateIndicator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (indicator: IndicatorFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("indicators")
        .insert({
          ...indicator,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] });
      toast({
        title: "Indicador criado",
        description: "O indicador foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar indicador",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateIndicator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IndicatorFormData> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: updated, error } = await supabase
        .from("indicators")
        .update({
          ...data,
          updated_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] });
      toast({
        title: "Indicador atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar indicador",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteIndicator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("indicators")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] });
      toast({
        title: "Indicador removido",
        description: "O indicador foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover indicador",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useToggleIndicatorActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("indicators")
        .update({
          is_active: isActive,
          updated_by: user?.id,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
