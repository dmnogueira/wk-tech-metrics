import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Squad } from "@/lib/models";
import { toast } from "sonner";

export function useSquads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSquads = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("squads")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Mapeia os dados do Supabase para o modelo local
      const mappedData: Squad[] = (data || []).map((squad: any, index: number) => ({
        id: squad.id,
        name: squad.name,
        area: squad.area || "",
        description: squad.description || "",
        managerId: squad.manager_id,
        order: index,
      }));

      setSquads(mappedData);
    } catch (error: any) {
      console.error("Error fetching squads:", error);
      toast.error("Erro ao carregar squads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();

    // Realtime subscription
    const channel = supabase
      .channel("squads-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "squads",
        },
        () => {
          fetchSquads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addSquad = async (squad: Omit<Squad, "id">) => {
    try {
      const { error } = await supabase.from("squads").insert({
        name: squad.name,
        area: squad.area,
        description: squad.description,
        manager_id: squad.managerId,
      });

      if (error) throw error;

      toast.success("Squad adicionado com sucesso");
      await fetchSquads();
    } catch (error: any) {
      console.error("Error adding squad:", error);
      toast.error("Erro ao adicionar squad");
      throw error;
    }
  };

  const updateSquad = async (id: string, updates: Partial<Squad>) => {
    try {
      const { error } = await supabase
        .from("squads")
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.area !== undefined && { area: updates.area }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.managerId !== undefined && { manager_id: updates.managerId }),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Squad atualizado com sucesso");
      await fetchSquads();
    } catch (error: any) {
      console.error("Error updating squad:", error);
      toast.error("Erro ao atualizar squad");
      throw error;
    }
  };

  const deleteSquad = async (id: string) => {
    try {
      const { error } = await supabase.from("squads").delete().eq("id", id);

      if (error) throw error;

      toast.success("Squad removido com sucesso");
      await fetchSquads();
    } catch (error: any) {
      console.error("Error deleting squad:", error);
      toast.error("Erro ao remover squad");
      throw error;
    }
  };

  const reorderSquads = async (reorderedSquads: Squad[]) => {
    try {
      // Atualiza a ordem localmente primeiro para feedback imediato
      setSquads(reorderedSquads);
      
      // Não há campo 'order' na tabela, então mantemos apenas a ordem local
      toast.success("Ordem atualizada");
    } catch (error: any) {
      console.error("Error reordering squads:", error);
      toast.error("Erro ao reordenar squads");
      await fetchSquads(); // Reverte em caso de erro
    }
  };

  return {
    squads,
    isLoading,
    addSquad,
    updateSquad,
    deleteSquad,
    reorderSquads,
    refreshSquads: fetchSquads,
  };
}
