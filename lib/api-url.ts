export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const isAbsolute = (url: string) => /^https?:\/\//i.test(url);

// URL da API para fetch feito no servidor (proxy, RSC). Lida em tempo de
// execução: API_INTERNAL_URL (só servidor, ex.: http://api:8080 no compose) e,
// na falta dela, NEXT_PUBLIC_API_URL quando absoluta. Uma URL relativa (/api)
// só resolve no navegador, então não serve aqui.
export function serverApiUrl(): string {
  const internal = process.env.API_INTERNAL_URL;
  if (internal) return internal.replace(/\/+$/, "");
  if (isAbsolute(API_URL)) return API_URL;
  throw new Error(
    "API_INTERNAL_URL não definida e NEXT_PUBLIC_API_URL é relativa; defina API_INTERNAL_URL para fetch no servidor."
  );
}
