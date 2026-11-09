import { isAxiosError } from "axios";

// Mensagem de erro da API ({ error }) ou o texto padrão.
export const apiErrorMessage = (err: unknown, fallback: string) => {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string } | undefined)?.error;
    if (msg && err.response?.status === 422) return msg;
  }
  return fallback;
};

export const loginErrorMessage = (err: unknown) => {
  if (isAxiosError(err)) {
    if (err.response?.status === 429) {
      const seconds = Number(err.response.headers?.["retry-after"]);
      return Number.isFinite(seconds) && seconds > 0
        ? `Muitas tentativas. Tente novamente em ${formatWait(seconds)}.`
        : "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    }
    if (err.response?.status === 401) return "E-mail ou senha inválidos.";
  }
  return "Não foi possível entrar. Tente novamente.";
};

const formatWait = (seconds: number) =>
  seconds >= 60 ? `${Math.ceil(seconds / 60)} min` : `${Math.ceil(seconds)} s`;
