import { loginErrorMessage } from "@/lib/errors";
import { hasAdminRole, isAdminPath, safeNext } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations";
import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

describe("papéis", () => {
  it("admin só com ROLE_ADMIN (o antigo role: 'admin' não vale)", () => {
    expect(hasAdminRole(["ROLE_ADMIN"])).toBe(true);
    expect(hasAdminRole(["ROLE_USER"])).toBe(false);
    expect(hasAdminRole(undefined)).toBe(false);
    expect(isAdminPath("/dashboard/users")).toBe(true);
    expect(isAdminPath("/dashboard/expenses")).toBe(false);
  });

  it("safeNext recusa destinos externos", () => {
    expect(safeNext("/dashboard/expenses")).toBe("/dashboard/expenses");
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext(null)).toBe("/dashboard");
  });
});

describe("validações", () => {
  it("login é por e-mail", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "usuario", password: "x" }).success).toBe(false);
  });

  const base = { username: "maria", email: "maria@x.com", confirmPassword: "" };
  const reg = (password: string) =>
    registerSchema.safeParse({ ...base, password, confirmPassword: password });

  it("senha ≥ 10, letras e números, sem e-mail/usuário", () => {
    expect(reg("curta1").success).toBe(false);
    expect(reg("somenteletras").success).toBe(false);
    expect(reg("1234567890123").success).toBe(false);
    expect(reg("MARIA-senha-12").success).toBe(false);
    expect(reg("cavalo-bateria-42").success).toBe(true);
  });
});

describe("mensagem do login", () => {
  const err = (status: number, headers = {}) =>
    new AxiosError("x", "E", undefined, null, {
      status,
      headers,
      data: {},
      statusText: "",
      config: {} as never,
    });

  it("429 mostra o Retry-After", () => {
    expect(loginErrorMessage(err(429, { "retry-after": "900" }))).toContain("15 min");
    expect(loginErrorMessage(err(429))).toContain("Muitas tentativas");
  });
  it("401", () => expect(loginErrorMessage(err(401))).toContain("inválidos"));
});
