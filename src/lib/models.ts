export type AppRole = "master" | "admin" | "gestao" | "usuario";

export interface Squad {
  id: string;
  name: string;
  area: string;
  description: string;
  managerId?: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  role: string;
  squad: string;
  seniority: string;
  profileType: "gestao" | "especialista" | "colaborador" | "master" | "admin";
  avatar?: string;
}

export interface JobRole {
  id: string;
  title: string;
  description?: string;
}
