import { serverApiUrl } from "@/lib/api-url";
import { ACCESS_COOKIE, hasAdminRole, isAdminPath } from "@/lib/session";
import type { User } from "@/types";
import { type NextRequest, NextResponse } from "next/server";

const toLogin = (req: NextRequest) => {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
};

// Quem está logado vem de GET /users/me com o cookie cg_access da sessão.
// Sem cookie (ou token expirado/revogado) → login; a tela de login tenta um
// POST /auth/refresh silencioso (o cg_refresh só viaja para /auth) antes de pedir senha.
export async function middleware(req: NextRequest) {
  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) return toLogin(req);

  let me: User | null = null;
  try {
    const res = await fetch(`${serverApiUrl()}/users/me`, {
      headers: { cookie: `${ACCESS_COOKIE}=${access}` },
      cache: "no-store",
    });
    if (res.ok) me = (await res.json()) as User;
  } catch {
    me = null;
  }
  if (!me) return toLogin(req);

  if (isAdminPath(req.nextUrl.pathname) && !hasAdminRole(me.roles)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
