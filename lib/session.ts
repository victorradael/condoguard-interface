import type { UserRole } from "@/types";

export const ACCESS_COOKIE = "cg_access";

// Área de admin: requer papel com users.manage ou users.read (a API também confere).
export const ADMIN_PATHS = ["/dashboard/users", "/dashboard/residents", "/dashboard/shop-owners"];

export const isAdminPath = (pathname: string) =>
  ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

// Papéis com acesso a área administrativa.
// Aceita tanto os nomes novos (pós-migração 00003) quanto os antigos (compat.).
const ADMIN_ROLES: readonly string[] = [
  "ROLE_ADMIN",
  "administradora",
  "sindico",
  "conselho",
];

export const hasAdminRole = (roles: readonly UserRole[] | undefined | null) =>
  !!roles?.some((r) => ADMIN_ROLES.includes(r));

// Só aceita caminhos internos como destino pós-login (evita open redirect).
export const safeNext = (next: string | null | undefined) =>
  next?.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/dashboard";
