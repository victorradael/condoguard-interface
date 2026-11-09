import { middleware } from "@/middleware";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const req = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie } : {},
  });

const mockMe = (status: number, body: unknown = {}) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status }))
  );

afterEach(() => vi.unstubAllGlobals());

const me = (roles: string[]) => ({ id: "1", username: "u", email: "u@x.com", roles });

describe("middleware", () => {
  it("sem cookie de sessão → login com next", async () => {
    const res = await middleware(req("/dashboard/expenses"));
    expect(res.status).toBe(307);
    const loc = new URL(res.headers.get("location") as string);
    expect(loc.pathname).toBe("/login");
    expect(loc.searchParams.get("next")).toBe("/dashboard/expenses");
  });

  it("token recusado pela API (401) → login", async () => {
    mockMe(401);
    const res = await middleware(req("/dashboard", "cg_access=expirado"));
    expect(new URL(res.headers.get("location") as string).pathname).toBe("/login");
  });

  it("API fora do ar → login (nega por padrão)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("down")))
    );
    const res = await middleware(req("/dashboard", "cg_access=x"));
    expect(new URL(res.headers.get("location") as string).pathname).toBe("/login");
  });

  it("encaminha o cookie cg_access para GET /users/me", async () => {
    mockMe(200, me(["ROLE_USER"]));
    await middleware(req("/dashboard", "cg_access=abc"));
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url)).toMatch(/\/users\/me$/);
    expect(init.headers.cookie).toBe("cg_access=abc");
  });

  it("NEXT_PUBLIC_API_URL relativa + API_INTERNAL_URL → usa a URL interna", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URL", "/api");
    vi.stubEnv("API_INTERNAL_URL", "http://api:8080/");
    const { middleware: mw } = await import("@/middleware");
    mockMe(200, me(["ROLE_USER"]));
    const res = await mw(req("/dashboard", "cg_access=abc"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url)).toBe("http://api:8080/users/me");
    vi.unstubAllEnvs();
  });

  it("NEXT_PUBLIC_API_URL relativa sem API_INTERNAL_URL → login (nega)", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URL", "/api");
    vi.stubEnv("API_INTERNAL_URL", "");
    const { middleware: mw } = await import("@/middleware");
    mockMe(200, me(["ROLE_USER"]));
    const res = await mw(req("/dashboard", "cg_access=abc"));
    expect(new URL(res.headers.get("location") as string).pathname).toBe("/login");
    vi.unstubAllEnvs();
  });

  it("ROLE_USER acessa o dashboard, mas não a área de admin", async () => {
    mockMe(200, me(["ROLE_USER"]));
    const ok = await middleware(req("/dashboard/expenses", "cg_access=abc"));
    expect(ok.headers.get("x-middleware-next")).toBe("1");

    for (const path of ["/dashboard/users", "/dashboard/residents", "/dashboard/shop-owners"]) {
      const res = await middleware(req(path, "cg_access=abc"));
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get("location") as string).pathname).toBe("/dashboard");
    }
  });

  it("ROLE_ADMIN acessa a área de admin", async () => {
    mockMe(200, me(["ROLE_ADMIN"]));
    const res = await middleware(req("/dashboard/users", "cg_access=abc"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});
