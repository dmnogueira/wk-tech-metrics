import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobRole } from "@/lib/models";
import { toast } from "sonner";

export function useJobRoles() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      // Mapeia os dados do Supabase para o modelo local
      const mappedData: JobRole[] = (data || []).map((position: any) => ({
        id: position.id,
        title: position.name,
        description: position.description || "",
      }));

      setJobRoles(mappedData);
    } catch (error: any) {
      console.error("Error fetching job roles:", error);
      toast.error("Erro ao carregar cargos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobRoles();

    // Realtime subscription
    const channel = supabase
      .channel("positions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "positions",
        },
        () => {
          fetchJobRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addJobRole = async (jobRole: Omit<JobRole, "id">) => {
    try {
      const { error } = await supabase.from("positions").insert({
        name: jobRole.title,
        description: jobRole.description,
      });

      if (error) throw error;

      toast.success("Cargo adicionado com sucesso");
      await fetchJobRoles();
    } catch (error: any) {
      console.error("Error adding job role:", error);
      toast.error("Erro ao adicionar cargo");
      throw error;
    }
  };

  const updateJobRole = async (id: string, updates: Partial<JobRole>) => {
    try {
      const { error } = await supabase
        .from("positions")
        .update({
          ...(updates.title && { name: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Cargo atualizado com sucesso");
      await fetchJobRoles();
    } catch (error: any) {
      console.error("Error updating job role:", error);
      toast.error("Erro ao atualizar cargo");
      throw error;
    }
  };

  const deleteJobRole = async (id: string) => {
    try {
      const { error } = await supabase.from("positions").delete().eq("id", id);

      if (error) throw error;

      toast.success("Cargo removido com sucesso");
      await fetchJobRoles();
    } catch (error: any) {
      console.error("Error deleting job role:", error);
      toast.error("Erro ao remover cargo");
      throw error;
    }
  };

  return {
    jobRoles,
    isLoading,
    addJobRole,
    updateJobRole,
    deleteJobRole,
    refreshJobRoles: fetchJobRoles,
  };
}
