import { expect, test } from "@playwright/test";
import { createTestAccount } from "./helpers";

// Reutiliza as credenciais de ambiente quando disponíveis; caso contrário cria
// uma conta descartável (require_verified_email=false no compose local).
let testEmail: string;
let testPassword: string;

test.beforeAll(async ({ request }) => {
  if (process.env.E2E_EMAIL && process.env.E2E_PASSWORD) {
    testEmail = process.env.E2E_EMAIL;
    testPassword = process.env.E2E_PASSWORD;
  } else {
    const suffix = Date.now().toString(36);
    const creds = await createTestAccount(request, suffix);
    testEmail = creds.email;
    testPassword = creds.password;
  }
});

test("página de login carrega", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entrar na sua conta" })).toBeVisible();
});

test("login com senha errada exibe erro", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(testEmail);
  await page.getByLabel("Senha").fill("senha-errada-99");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("E-mail ou senha inválidos")).toBeVisible();
});

test("login com credenciais válidas redireciona para dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(testEmail);
  await page.getByLabel("Senha").fill(testPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("link 'Esqueceu a senha?' leva para recuperar-senha", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Esqueceu a senha?" }).click();
  await expect(page).toHaveURL(/\/recuperar-senha/);
  await expect(page.getByRole("heading", { name: "Recuperar senha" })).toBeVisible();
});

test("/dashboard sem sessão redireciona para login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("logout encerra a sessão", async ({ page }) => {
  // Faz login
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(testEmail);
  await page.getByLabel("Senha").fill(testPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Clica no logout (sidebar)
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login/);
});
