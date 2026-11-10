import { api, enable2fa, fetchAll, forgotPassword, login, resetPassword, setup2fa, verifyEmail, verify2fa } from "@/lib/api";
import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (config: AxiosRequestConfig) => { status: number; data?: unknown; headers?: object };

const respond =
  (handler: Handler): AxiosAdapter =>
  async (config) => {
    const { status, data = {}, headers = {} } = handler(config);
    const response = { data, status, statusText: "", headers, config } as AxiosResponse;
    if (status >= 400) {
      throw new AxiosError("fail", "ERR_BAD_REQUEST", config, null, response);
    }
    return response;
  };

let calls: string[];
let setup: (handler: Handler) => void;

beforeEach(() => {
  calls = [];
  setup = (handler) => {
    api.defaults.adapter = respond((config) => {
      calls.push(`${config.method} ${config.url}`);
      return handler(config);
    });
  };
  localStorage.clear();
  sessionStorage.clear();
});

describe("cliente da API", () => {
  it("envia credenciais (cookies) e nenhum cabeçalho Authorization", async () => {
    let seen: AxiosRequestConfig | undefined;
    setup((config) => {
      seen = config;
      return { status: 200, data: { roles: ["ROLE_USER"], tokenType: "Bearer", expiresIn: 900 } };
    });
    await login("a@b.com", "senha-segura-123");
    expect(seen?.withCredentials).toBe(true);
    expect(JSON.parse(seen?.data)).toEqual({
      email: "a@b.com",
      password: "senha-segura-123",
      useCookies: true,
    });
    expect(seen?.headers?.Authorization).toBeUndefined();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it("no 401 faz um refresh e repete a requisição", async () => {
    let first = true;
    setup((config) => {
      if (config.url === "/auth/refresh") return { status: 200 };
      if (first) {
        first = false;
        return { status: 401 };
      }
      return { status: 200, data: { items: [], page: 1, pageSize: 20, total: 0 } };
    });
    const res = await api.get("/expenses");
    expect(res.status).toBe(200);
    expect(calls).toEqual(["get /expenses", "post /auth/refresh", "get /expenses"]);
  });

  it("se o refresh falhar, não insiste e propaga o 401", async () => {
    setup(() => ({ status: 401 }));
    await expect(api.get("/expenses")).rejects.toMatchObject({ response: { status: 401 } });
    expect(calls).toEqual(["get /expenses", "post /auth/refresh"]);
  });

  it("não tenta refresh no login com senha errada", async () => {
    setup(() => ({ status: 401 }));
    await expect(login("a@b.com", "x")).rejects.toBeDefined();
    expect(calls).toEqual(["post /auth/login"]);
  });

  it("fetchAll percorre as páginas de 100 em 100", async () => {
    const fetchPage = vi.fn(async (page: number) => ({
      data: { items: [page * 2 - 1, page * 2], page, pageSize: 100, total: 5 },
    }));
    // total=5 com 2 itens/página → 3 páginas
    const items = await fetchAll(fetchPage as never);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage.mock.calls[0]).toEqual([1, 100]);
    expect(items).toHaveLength(6);
  });

  it("login com condominiumId inclui o campo no corpo", async () => {
    let seen: AxiosRequestConfig | undefined;
    setup((config) => {
      seen = config;
      return { status: 200, data: { roles: ["sindico"], tokenType: "Bearer", expiresIn: 900 } };
    });
    await login("a@b.com", "senha-segura-123", "condo-id-abc");
    expect(JSON.parse(seen?.data)).toMatchObject({ condominiumId: "condo-id-abc" });
  });

  it("verifyEmail envia token no corpo", async () => {
    let seen: AxiosRequestConfig | undefined;
    setup((config) => {
      seen = config;
      return { status: 202 };
    });
    await verifyEmail("tok-abc");
    expect(JSON.parse(seen?.data)).toEqual({ token: "tok-abc" });
  });

  it("forgotPassword envia e-mail no corpo", async () => {
    let seen: AxiosRequestConfig | undefined;
    setup((config) => {
      seen = config;
      return { status: 202 };
    });
    await forgotPassword("user@x.com");
    expect(JSON.parse(seen?.data)).toEqual({ email: "user@x.com" });
  });

  it("resetPassword envia token e senha", async () => {
    let seen: AxiosRequestConfig | undefined;
    setup((config) => {
      seen = config;
      return { status: 204 };
    });
    await resetPassword("reset-tok", "nova-senha-42");
    expect(JSON.parse(seen?.data)).toMatchObject({ token: "reset-tok", password: "nova-senha-42" });
  });

  it("setup2fa envia mfaToken quando fornecido", async () => {
    let seen: AxiosRequestConfig | undefined;
    setup((config) => {
      seen = config;
      return { status: 200, data: { secret: "S", otpauthUrl: "otpauth://u", qrCode: "b64" } };
    });
    await setup2fa("mfa-tok-123");
    expect(JSON.parse(seen?.data)).toMatchObject({ mfaToken: "mfa-tok-123" });
  });

  it("verify2fa envia código e mfaToken com useCookies", async () => {
    let seen: AxiosRequestConfig | undefined;
    setup((config) => {
      seen = config;
      return { status: 200 };
    });
    await verify2fa("654321", "mfa-tok-xyz");
    const body = JSON.parse(seen?.data);
    expect(body).toMatchObject({ code: "654321", mfaToken: "mfa-tok-xyz", useCookies: true });
  });

  it("enable2fa envia código e mfaToken quando fornecido", async () => {
    let seen: AxiosRequestConfig | undefined;
    setup((config) => {
      seen = config;
      return { status: 200, data: { recoveryCodes: ["a", "b"] } };
    });
    await enable2fa("123456", "enroll-tok");
    expect(JSON.parse(seen?.data)).toMatchObject({ code: "123456", mfaToken: "enroll-tok" });
  });
});
