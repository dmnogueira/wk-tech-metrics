import { AppRole } from "./models";

export const currentUserRole: AppRole = "master";

export function hasPermission(allowedRoles: AppRole[]) {
  return allowedRoles.includes(currentUserRole);
}
