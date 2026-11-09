import { loginError, loginErrorMessage } from "@/lib/errors";
import { hasAdminRole, isAdminPath, safeNext } from "@/lib/session";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  totpCodeSchema,
} from "@/lib/validations";
import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

describe("papéis", () => {
  it("admin com ROLE_ADMIN (legado) ou papéis novos (sindico, administradora, conselho)", () => {
    // papéis legados ainda aceitos
    expect(hasAdminRole(["ROLE_ADMIN"])).toBe(true);
    expect(hasAdminRole(["ROLE_USER"])).toBe(false);
    // papéis novos (pós-migração 00003)
    expect(hasAdminRole(["sindico"])).toBe(true);
    expect(hasAdminRole(["administradora"])).toBe(true);
    expect(hasAdminRole(["conselho"])).toBe(true);
    expect(hasAdminRole(["porteiro"])).toBe(false);
    expect(hasAdminRole(["morador"])).toBe(false);
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

  it("forgotPasswordSchema aceita e-mail válido", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "nao-email" }).success).toBe(false);
  });

  it("resetPasswordSchema exige senhas coincidentes e ≥ 10 chars", () => {
    const ok = { password: "cavalo-bateria-42", confirmPassword: "cavalo-bateria-42" };
    expect(resetPasswordSchema.safeParse(ok).success).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ ...ok, confirmPassword: "diferente-99" }).success
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({ password: "curta1", confirmPassword: "curta1" }).success
    ).toBe(false);
  });

  it("totpCodeSchema aceita apenas dígitos (6–8)", () => {
    expect(totpCodeSchema.safeParse({ code: "123456" }).success).toBe(true);
    expect(totpCodeSchema.safeParse({ code: "12345678" }).success).toBe(true);
    expect(totpCodeSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(totpCodeSchema.safeParse({ code: "123456a" }).success).toBe(false);
  });
});

describe("mensagem do login", () => {
  const err = (status: number, data: unknown = {}, headers = {}) =>
    new AxiosError("x", "E", undefined, null, {
      status,
      headers,
      data,
      statusText: "",
      config: {} as never,
    });

  it("429 mostra o Retry-After", () => {
    expect(loginErrorMessage(err(429, {}, { "retry-after": "900" }))).toContain("15 min");
    expect(loginErrorMessage(err(429))).toContain("Muitas tentativas");
  });
  it("401", () => expect(loginErrorMessage(err(401))).toContain("inválidos"));
  it("403 email_not_verified retorna kind correto", () => {
    const e = loginError(err(403, { error: "email_not_verified" }));
    expect(e.kind).toBe("email_not_verified");
  });
  it("403 outro erro não é email_not_verified", () => {
    const e = loginError(err(403, { error: "forbidden" }));
    expect(e.kind).toBe("generic");
  });
});
