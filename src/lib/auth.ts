import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "./models";

let cachedUserRole: AppRole | null = null;
let cachedUserId: string | null = null;

export async function getCurrentUserRole(): Promise<AppRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      cachedUserRole = null;
      cachedUserId = null;
      return null;
    }

    // If same user, return cached role
    if (cachedUserId === user.id && cachedUserRole) {
      return cachedUserRole;
    }

    // Fetch user roles from database
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching user roles:", error);
      return null;
    }

    if (!roles || roles.length === 0) {
      cachedUserRole = "usuario";
      cachedUserId = user.id;
      return "usuario";
    }

    // Priority: master > admin > gestao > usuario
    const rolePriority: Record<AppRole, number> = {
      master: 4,
      admin: 3,
      gestao: 2,
      usuario: 1,
    };

    const highestRole = roles.reduce((highest, current) => {
      const currentRole = current.role as AppRole;
      return rolePriority[currentRole] > rolePriority[highest] ? currentRole : highest;
    }, roles[0].role as AppRole);

    cachedUserRole = highestRole;
    cachedUserId = user.id;
    return highestRole;
  } catch (error) {
    console.error("Error in getCurrentUserRole:", error);
    return null;
  }
}

export function clearRoleCache() {
  cachedUserRole = null;
  cachedUserId = null;
}

export async function hasPermission(allowedRoles: AppRole[]): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role ? allowedRoles.includes(role) : false;
}

// Synchronous version for components that need immediate check
// Note: This uses cached value and may be stale
export function hasPermissionSync(allowedRoles: AppRole[]): boolean {
  return cachedUserRole ? allowedRoles.includes(cachedUserRole) : false;
}
