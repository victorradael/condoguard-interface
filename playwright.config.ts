import { defineConfig, devices } from "@playwright/test";

// Compose: https://localhost (Caddy). Aceita o CA local (make trust-ca).
// Variáveis de ambiente (passadas pelo Makefile ou CI):
//   BASE_URL       — URL base do compose (padrão: https://localhost)
//   MAILPIT_URL    — URL da UI/API do Mailpit (padrão: http://localhost:8025)
//   E2E_EMAIL      — conta de teste com papel sindico
//   E2E_PASSWORD   — senha da conta de teste

const BASE_URL = process.env.BASE_URL ?? "https://localhost";
const isLocalTLS = BASE_URL.startsWith("https://localhost");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    // Aceita o CA autoassinado do Caddy local.
    ignoreHTTPSErrors: isLocalTLS,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Não sobe o web aqui; pressupõe que `make up` já rodou.
  webServer: undefined,
});
