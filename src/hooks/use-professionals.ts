import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Professional } from "@/lib/models";
import { toast } from "sonner";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("professionals")
        .select(`
          *,
          profile:profiles!professionals_profile_id_fkey(full_name, email, avatar_url),
          position:positions(name),
          squad:squads(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Mapeia os dados do Supabase para o modelo local
      const mappedData: Professional[] = (data || []).map((prof: any) => ({
        id: prof.id,
        name: prof.profile?.full_name || "",
        email: prof.profile?.email || "",
        role: prof.position?.name || "",
        squad: prof.squad?.name || "",
        seniority: prof.seniority || "Pleno",
        profileType: (prof.profile_type || "colaborador") as Professional["profileType"],
        avatar: prof.avatar_url || prof.profile?.avatar_url,
        managerId: prof.manager_id,
        managedSquads: prof.managed_squads || [],
      }));

      setProfessionals(mappedData);
    } catch (error: any) {
      console.error("Error fetching professionals:", error);
      toast.error("Erro ao carregar profissionais");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();

    // Realtime subscription
    const channel = supabase
      .channel("professionals-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "professionals",
        },
        () => {
          fetchProfessionals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProfessional = async (professional: Omit<Professional, "id">) => {
    try {
      // Primeiro, criar ou buscar o profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", professional.email)
        .maybeSingle();

      let profileId = existingProfile?.id;

      if (!profileId) {
        // Gerar um UUID para o novo profile
        const newProfileId = crypto.randomUUID();
        
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: newProfileId,
            full_name: professional.name,
            email: professional.email,
            avatar_url: professional.avatar || null,
          } as any)
          .select()
          .single();

        if (profileError) throw profileError;
        profileId = newProfile.id;
      }

      // Buscar position_id e squad_id
      let positionId = null;
      let squadId = null;

      if (professional.role) {
        const { data: position } = await supabase
          .from("positions")
          .select("id")
          .eq("name", professional.role)
          .maybeSingle();
        positionId = position?.id;
      }

      if (professional.squad) {
        const { data: squad } = await supabase
          .from("squads")
          .select("id")
          .eq("name", professional.squad)
          .maybeSingle();
        squadId = squad?.id;
      }

      // Inserir professional
      const { data: inserted, error } = await supabase
        .from("professionals")
        .insert({
          profile_id: profileId,
          position_id: positionId,
          squad_id: squadId,
          seniority: professional.seniority,
          avatar_url: professional.avatar,
          profile_type: professional.profileType,
          manager_id: professional.managerId || null,
          managed_squads: professional.managedSquads || [],
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Profissional adicionado com sucesso");
      await fetchProfessionals();
      return inserted?.id;
    } catch (error: any) {
      console.error("Error adding professional:", error);
      toast.error("Erro ao adicionar profissional");
      throw error;
    }
  };

  const updateProfessional = async (id: string, updates: Partial<Professional>) => {
    try {
      // Buscar position_id e squad_id se necessário
      let positionId = undefined;
      let squadId = undefined;

      if (updates.role) {
        const { data: position } = await supabase
          .from("positions")
          .select("id")
          .eq("name", updates.role)
          .maybeSingle();
        positionId = position?.id || null;
      }

      if (updates.squad !== undefined) {
        if (updates.squad) {
          const { data: squad } = await supabase
            .from("squads")
            .select("id")
            .eq("name", updates.squad)
            .maybeSingle();
          squadId = squad?.id || null;
        } else {
          squadId = null;
        }
      }

      const { error } = await supabase
        .from("professionals")
        .update({
          ...(positionId !== undefined && { position_id: positionId }),
          ...(squadId !== undefined && { squad_id: squadId }),
          ...(updates.seniority && { seniority: updates.seniority }),
          ...(updates.avatar !== undefined && { avatar_url: updates.avatar }),
          ...(updates.profileType && { profile_type: updates.profileType }),
          ...(updates.managerId !== undefined && { manager_id: updates.managerId }),
          ...(updates.managedSquads !== undefined && { managed_squads: updates.managedSquads }),
        })
        .eq("id", id);

      if (error) throw error;

      // Atualizar profile se necessário
      if (updates.name || updates.email || updates.avatar) {
        const professional = professionals.find((p) => p.id === id);
        if (professional) {
          const { data: prof } = await supabase
            .from("professionals")
            .select("profile_id")
            .eq("id", id)
            .single();

          if (prof) {
            await supabase
              .from("profiles")
              .update({
                ...(updates.name && { full_name: updates.name }),
                ...(updates.email && { email: updates.email }),
                ...(updates.avatar && { avatar_url: updates.avatar }),
              })
              .eq("id", prof.profile_id);
          }
        }
      }

      toast.success("Profissional atualizado com sucesso");
      await fetchProfessionals();
    } catch (error: any) {
      console.error("Error updating professional:", error);
      toast.error("Erro ao atualizar profissional");
      throw error;
    }
  };

  const deleteProfessional = async (id: string) => {
    try {
      const { error } = await supabase
        .from("professionals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Profissional removido com sucesso");
      await fetchProfessionals();
    } catch (error: any) {
      console.error("Error deleting professional:", error);
      toast.error("Erro ao remover profissional");
      throw error;
    }
  };

  return {
    professionals,
    isLoading,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    refreshProfessionals: fetchProfessionals,
  };
}
