import { isAxiosError } from "axios";

// Mensagem de erro da API ({ error }) ou o texto padrão.
// Inclui 409 (conflito) e 422 (validação), além de 403 e 404 com fallback.
export const apiErrorMessage = (err: unknown, fallback: string) => {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const msg = (err.response?.data as { error?: string } | undefined)?.error;
    if (msg && (status === 422 || status === 409)) return msg;
    if (status === 403) return "Você não tem permissão para esta operação.";
    if (status === 404) return "Registro não encontrado.";
    if (status === 422) return msg ?? fallback;
  }
  return fallback;
};

export type LoginErrorKind =
  | { kind: "generic"; message: string }
  | { kind: "email_not_verified" }
  | { kind: "rate_limited"; message: string };

export const loginError = (err: unknown): LoginErrorKind => {
  if (isAxiosError(err)) {
    if (err.response?.status === 429) {
      const seconds = Number(err.response.headers?.["retry-after"]);
      const message =
        Number.isFinite(seconds) && seconds > 0
          ? `Muitas tentativas. Tente novamente em ${formatWait(seconds)}.`
          : "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
      return { kind: "rate_limited", message };
    }
    if (err.response?.status === 401) {
      return { kind: "generic", message: "E-mail ou senha inválidos." };
    }
    if (
      err.response?.status === 403 &&
      (err.response.data as { error?: string })?.error === "email_not_verified"
    ) {
      return { kind: "email_not_verified" };
    }
  }
  return { kind: "generic", message: "Não foi possível entrar. Tente novamente." };
};

export const loginErrorMessage = (err: unknown): string => {
  const e = loginError(err);
  if (e.kind === "email_not_verified") return "E-mail não verificado.";
  return e.message;
};

const formatWait = (seconds: number) =>
  seconds >= 60 ? `${Math.ceil(seconds / 60)} min` : `${Math.ceil(seconds)} s`;
