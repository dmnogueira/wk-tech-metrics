export type AppRole = "master" | "admin" | "gestao" | "usuario";

export interface Squad {
  id: string;
  name: string;
  area: string;
  description: string;
  managerId?: string;
  order?: number;
}

export interface Professional {
  id: string;
  profileId: string; // ID do profile/usuário no auth
  name: string;
  email: string;
  role: string;
  squad: string;
  seniority: string;
  profileType: "gestao" | "especialista" | "colaborador" | "master" | "admin";
  avatar?: string;
  managerId?: string;
  managedSquads?: string[]; // Squads gerenciados (para perfil gestão)
}

export interface JobRole {
  id: string;
  title: string;
  description?: string;
  isManagement?: boolean;
}
