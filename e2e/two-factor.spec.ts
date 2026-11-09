import { expect, test } from "@playwright/test";

// Testes de 2FA requerem:
// - Conta de teste com papel que exige 2FA (sindico, administradora, conselho)
//   OU conta sem 2FA ainda para simular o fluxo de enroll voluntário.
// - E2E_2FA_EMAIL e E2E_2FA_PASSWORD como variáveis de ambiente.
// - Para o caso de enroll, E2E_2FA_ENROLL_EMAIL / E2E_2FA_ENROLL_PASSWORD.

const mfaEmail = process.env.E2E_2FA_EMAIL ?? "";
const mfaPassword = process.env.E2E_2FA_PASSWORD ?? "";
const enrollEmail = process.env.E2E_2FA_ENROLL_EMAIL ?? "";
const enrollPassword = process.env.E2E_2FA_ENROLL_PASSWORD ?? "";

test.describe("2FA — verificação (stage: verify)", () => {
  test.skip(!mfaEmail, "Defina E2E_2FA_EMAIL e E2E_2FA_PASSWORD para rodar estes testes");

  test("login com conta 2FA habilitada exibe tela de verificação", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(mfaEmail);
    await page.getByLabel("Senha").fill(mfaPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(
      page.getByRole("heading", { name: "Autenticação em dois fatores" })
    ).toBeVisible();
    await expect(page.getByLabel("Código")).toBeVisible();
  });

  test("código inválido exibe erro na tela de verificação", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(mfaEmail);
    await page.getByLabel("Senha").fill(mfaPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByLabel("Código").fill("000000");
    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page.getByText(/inválido|expirado/)).toBeVisible();
  });

  test("'Voltar ao login' retorna para a tela de credenciais", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(mfaEmail);
    await page.getByLabel("Senha").fill(mfaPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Voltar ao login" }).click();
    await expect(page.getByRole("heading", { name: "Entrar na sua conta" })).toBeVisible();
  });
});

test.describe("2FA — cadastro obrigatório (stage: enroll)", () => {
  test.skip(
    !enrollEmail,
    "Defina E2E_2FA_ENROLL_EMAIL / E2E_2FA_ENROLL_PASSWORD para o fluxo de enroll"
  );

  test("conta com papel que exige 2FA e sem 2FA habilitado exibe tela de enroll", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(enrollEmail);
    await page.getByLabel("Senha").fill(enrollPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(
      page.getByRole("heading", { name: "Autenticação em dois fatores" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Configurar 2FA" })).toBeVisible();
  });

  test("clicar em 'Configurar 2FA' exibe QR code e campo de código", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(enrollEmail);
    await page.getByLabel("Senha").fill(enrollPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Configurar 2FA" }).click();
    await expect(page.getByRole("heading", { name: "Configurar 2FA" })).toBeVisible();
    await expect(page.locator('img[alt="QR Code 2FA"]')).toBeVisible();
    await expect(page.getByLabel("Código do app autenticador")).toBeVisible();
  });

  test("código inválido no setup exibe erro", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(enrollEmail);
    await page.getByLabel("Senha").fill(enrollPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Configurar 2FA" }).click();
    await page.getByLabel("Código do app autenticador").fill("000000");
    await page.getByRole("button", { name: "Confirmar e ativar 2FA" }).click();
    await expect(page.getByText(/inválido/)).toBeVisible();
  });
});
