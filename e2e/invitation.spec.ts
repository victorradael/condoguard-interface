import { expect, test } from "@playwright/test";

// Requer E2E_EMAIL / E2E_PASSWORD (conta síndico) e ambiente compose
// (REQUIRE_VERIFIED_EMAIL=false para que o convite por link não bloqueie o login).
// API_URL aponta para o serviço de API; o contexto do browser compartilha os cookies
// após o login via UI, permitindo as chamadas autenticadas a seguir.

const API_URL = process.env.API_URL ?? "http://localhost:8080";
const adminEmail = process.env.E2E_EMAIL ?? "";
const adminPassword = process.env.E2E_PASSWORD ?? "";

test.describe("convite → ativação → dependente", () => {
  test.skip(!adminEmail, "Requer E2E_EMAIL e E2E_PASSWORD (conta síndico)");

  test("síndico gera convite por link → morador ativa conta → síndico cadastra dependente", async ({
    page,
  }) => {
    const suffix = Date.now().toString(36);
    const residentName = `Morador E2E ${suffix}`;
    const residentEmail = `morador-${suffix}@e2e.condoguard.local`;
    const residentPassword = `Morador-E2e-${suffix}-42`;
    const dependentName = `Dependente E2E ${suffix}`;

    // 1. Login como síndico via UI (os cookies ficam no contexto do browser).
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(adminEmail);
    await page.getByLabel("Senha").fill(adminPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Criar pessoa + unidade + vínculo via API usando os cookies do contexto.
    const ctx = page.context().request;

    const personRes = await ctx.post(`${API_URL}/people`, {
      data: { fullName: residentName, email: residentEmail },
      ignoreHTTPSErrors: true,
    });
    expect(personRes.status()).toBe(201);
    const { id: personId } = (await personRes.json()) as { id: string };

    const unitRes = await ctx.post(`${API_URL}/units`, {
      data: { unitNumber: `E2E-${suffix}` },
      ignoreHTTPSErrors: true,
    });
    expect(unitRes.status()).toBe(201);
    const { id: unitId } = (await unitRes.json()) as { id: string };

    const linkRes = await ctx.post(`${API_URL}/units/${unitId}/links`, {
      data: { personId, kind: "proprietario" },
      ignoreHTTPSErrors: true,
    });
    expect(linkRes.status()).toBe(201);

    // 3. Gerar convite por link (token devolvido na resposta, uma única vez).
    const invRes = await ctx.post(`${API_URL}/people/${personId}/invitations`, {
      data: { channel: "link" },
      ignoreHTTPSErrors: true,
    });
    expect(invRes.status()).toBe(201);
    const { token } = (await invRes.json()) as { token: string };
    expect(token).toBeTruthy();

    // 4. Verificar convite pendente na ficha da pessoa.
    await page.goto(`/dashboard/pessoas/${personId}`);
    await expect(page.getByText(residentName)).toBeVisible();
    await expect(page.getByText("Pendente")).toBeVisible();

    // 5. Morador acessa a página de convite com o token e cria a conta.
    await page.goto(`/convite?token=${token}`);
    await expect(page.getByText(residentName)).toBeVisible();
    await page.getByLabel("Nome de usuário").fill(`morador${suffix}`);
    await page.getByLabel("Senha", { exact: true }).fill(residentPassword);
    await page.getByLabel("Confirmar senha").fill(residentPassword);
    await page.getByRole("button", { name: "Aceitar convite" }).click();
    await expect(page.getByRole("heading", { name: "Convite aceito!" })).toBeVisible();

    // 6. Login como morador recém-ativado (verifica ativação bem-sucedida).
    await page.getByRole("button", { name: "Ir para o login" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel("E-mail").fill(residentEmail);
    await page.getByLabel("Senha").fill(residentPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 7. Logout e login como síndico para a etapa de dependente.
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel("E-mail").fill(adminEmail);
    await page.getByLabel("Senha").fill(adminPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 8. Verificar que a pessoa agora tem conta ativa.
    await page.goto(`/dashboard/pessoas/${personId}`);
    await expect(page.getByText("Ativa")).toBeVisible();

    // 9. Cadastrar dependente na unidade via UI.
    await page.goto(`/dashboard/unidades/${unitId}`);
    await page.getByRole("button", { name: "Adicionar vínculo" }).click();
    await page.locator("#add-kind").selectOption("dependente");
    // Marcar "Nova pessoa (ainda não cadastrada)"
    await page
      .locator("label", { hasText: "Nova pessoa" })
      .locator('input[type="checkbox"]')
      .check();
    await page.getByLabel("Nome completo").fill(dependentName);
    await page.getByRole("button", { name: "Adicionar" }).click();

    // 10. Dependente aparece na lista de vínculos.
    await expect(page.getByText(dependentName)).toBeVisible();
    await expect(
      page.locator(".divide-y .flex", { hasText: dependentName }).getByText("Dependente")
    ).toBeVisible();
  });
});
