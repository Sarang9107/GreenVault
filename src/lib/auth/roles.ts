export type Role = "ADMIN" | "PROVIDER" | "PUBLIC";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  PROVIDER: "Data Provider",
  PUBLIC: "Public",
};

export function isRole(value: unknown): value is Role {
  return value === "ADMIN" || value === "PROVIDER" || value === "PUBLIC";
}

export function canAccessAdmin(role: Role) {
  return role === "ADMIN";
}

export function canAccessProvider(role: Role) {
  return role === "ADMIN" || role === "PROVIDER";
}


