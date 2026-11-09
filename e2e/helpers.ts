import type { APIRequestContext } from "@playwright/test";

const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://localhost:8025";
const API_URL = process.env.API_URL ?? "http://localhost:8080";

// Busca o link/token do último e-mail enviado a um endereço via API do Mailpit.
export async function getLatestEmailLink(
  request: APIRequestContext,
  to: string,
  linkPattern: RegExp,
  timeout = 10_000
): Promise<string> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const res = await request.get(`${MAILPIT_URL}/api/v1/messages?limit=20`);
    const { messages } = (await res.json()) as { messages: { id: string; to: { address: string }[] }[] };
    const msg = messages?.find((m) => m.to.some((t) => t.address === to));
    if (msg) {
      const detail = await request.get(`${MAILPIT_URL}/api/v1/message/${msg.id}`);
      const { Text: text, HTML: html } = (await detail.json()) as { Text?: string; HTML?: string };
      const content = text ?? html ?? "";
      const match = content.match(linkPattern);
      if (match?.[1]) return match[1];
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`E-mail para ${to} com link matching ${linkPattern} não chegou em ${timeout}ms`);
}

// Cria uma conta descartável via API e devolve as credenciais.
export async function createTestAccount(
  request: APIRequestContext,
  suffix: string
): Promise<{ email: string; password: string; username: string }> {
  const email = `e2e-${suffix}@e2e.condoguard.local`;
  const password = `E2e-Test-${suffix}-42`;
  const username = `e2etst${suffix}`;
  const res = await request.post(`${API_URL}/auth/register`, {
    data: { username, email, password },
    ignoreHTTPSErrors: true,
  });
  if (!res.ok()) throw new Error(`Falha no cadastro: ${res.status()} ${await res.text()}`);
  return { email, password, username };
}

// Extrai token de um link (ex.: /verificar-email?token=TOKEN ou /redefinir-senha?token=TOKEN).
export function extractTokenFromUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get("token");
  } catch {
    return null;
  }
}
