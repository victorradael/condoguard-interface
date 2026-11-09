import type { UserRole } from "@/types";

export const ACCESS_COOKIE = "cg_access";

// Área de admin: só ROLE_ADMIN (a API também confere em cada rota).
export const ADMIN_PATHS = ["/dashboard/users", "/dashboard/residents", "/dashboard/shop-owners"];

export const isAdminPath = (pathname: string) =>
  ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const hasAdminRole = (roles: readonly UserRole[] | undefined | null) =>
  !!roles?.includes("ROLE_ADMIN");

// Só aceita caminhos internos como destino pós-login (evita open redirect).
export const safeNext = (next: string | null | undefined) =>
  next?.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/dashboard";
