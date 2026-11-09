import { expect, test } from "@playwright/test";
import { createTestAccount, extractTokenFromUrl, getLatestEmailLink } from "./helpers";

// Requer REQUIRE_VERIFIED_EMAIL=false no compose (padrão local) OU
// MAILPIT_URL configurado para confirmar o e-mail antes.
test.describe("recuperação de senha", () => {
  test("fluxo completo: solicitar → receber e-mail → redefinir", async ({ page, request }) => {
    const suffix = `pw${Date.now().toString(36)}`;
    const { email, password } = await createTestAccount(request, suffix);

    // 1. Acessa a página de recuperação
    await page.goto("/recuperar-senha");
    await expect(page.getByRole("heading", { name: "Recuperar senha" })).toBeVisible();

    // 2. Solicita o link de redefinição
    await page.getByLabel("E-mail").fill(email);
    await page.getByRole("button", { name: "Enviar link de recuperação" }).click();
    await expect(page.getByRole("heading", { name: "Verifique seu e-mail" })).toBeVisible();

    // 3. Busca o link no Mailpit
    const link = await getLatestEmailLink(
      request,
      email,
      /https?:\/\/[^/]+\/redefinir-senha\?token=([^"&\s]+)/
    );
    const token = extractTokenFromUrl(link);
    expect(token).toBeTruthy();

    // 4. Acessa a página de redefinição com o token
    await page.goto(`/redefinir-senha?token=${token}`);
    await expect(page.getByRole("heading", { name: "Redefinir senha" })).toBeVisible();

    // 5. Define a nova senha
    const newPassword = `NovaSenha-${suffix}-99`;
    await page.getByLabel("Nova senha").fill(newPassword);
    await page.getByLabel("Confirmar nova senha").fill(newPassword);
    await page.getByRole("button", { name: "Redefinir senha" }).click();
    await expect(page.getByRole("heading", { name: "Senha redefinida" })).toBeVisible();

    // 6. Verifica que a senha antiga não funciona mais
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("inválidos")).toBeVisible();

    // 7. Nova senha funciona
    await page.getByLabel("Senha").fill(newPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("token inválido mostra erro", async ({ page }) => {
    await page.goto("/redefinir-senha?token=token-invalido-xyz");
    await page.getByLabel("Nova senha").fill("NovaSenha-Valida-42");
    await page.getByLabel("Confirmar nova senha").fill("NovaSenha-Valida-42");
    await page.getByRole("button", { name: "Redefinir senha" }).click();
    await expect(page.getByText("inválido ou expirado")).toBeVisible();
  });

  test("sem token na URL mostra mensagem adequada", async ({ page }) => {
    await page.goto("/redefinir-senha");
    await expect(page.getByText("Use o link enviado")).toBeVisible();
  });

  test("senhas diferentes mostram erro de validação", async ({ page }) => {
    await page.goto("/redefinir-senha?token=qualquer");
    await page.getByLabel("Nova senha").fill("SenhaA-Valida-42");
    await page.getByLabel("Confirmar nova senha").fill("SenhaB-Valida-42");
    await page.getByRole("button", { name: "Redefinir senha" }).click();
    await expect(page.getByText("não coincidem")).toBeVisible();
  });
});

test.describe("verificação de e-mail", () => {
  test("link inválido exibe erro", async ({ page }) => {
    await page.goto("/verificar-email?token=token-invalido");
    await expect(
      page.getByRole("heading", { name: /inválido|expirado/i })
    ).toBeVisible();
  });

  test("sem token na URL exibe mensagem adequada", async ({ page }) => {
    await page.goto("/verificar-email");
    await expect(page.getByText("Use o link de verificação")).toBeVisible();
  });

  test("token válido confirma conta", async ({ page, request }) => {
    const suffix = `em${Date.now().toString(36)}`;
    const { email } = await createTestAccount(request, suffix);

    const link = await getLatestEmailLink(
      request,
      email,
      /https?:\/\/[^/]+\/verificar-email\?token=([^"&\s]+)/
    );
    const token = extractTokenFromUrl(link);
    expect(token).toBeTruthy();

    await page.goto(`/verificar-email?token=${token}`);
    await expect(page.getByRole("heading", { name: "E-mail verificado!" })).toBeVisible();
  });
});
