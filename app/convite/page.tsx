"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acceptInvitation, inspectInvitation } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { passwordSchema } from "@/lib/validations";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Stage =
  | { name: "loading" }
  | { name: "error"; message: string }
  | {
      name: "accept";
      condominiumName: string;
      personName: string;
      email: string;
      accountExists: boolean;
      token: string;
    }
  | { name: "done"; email: string; verifyEmail: boolean };

function ConviteForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [stage, setStage] = useState<Stage>({ name: "loading" });
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setStage({ name: "error", message: "Token de convite não informado." });
      return;
    }
    inspectInvitation(token)
      .then(({ data }) => {
        setStage({
          name: "accept",
          condominiumName: data.condominiumName,
          personName: data.personName,
          email: data.email,
          accountExists: data.accountExists,
          token,
        });
      })
      .catch(() => {
        setStage({ name: "error", message: "Convite inválido, expirado ou já utilizado." });
      });
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage.name !== "accept") return;
    setFormError(null);

    if (!stage.accountExists) {
      if (!form.username || form.username.length < 3) {
        setFormError("Nome de usuário deve ter ao menos 3 caracteres.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setFormError("As senhas não coincidem.");
        return;
      }
      const parsed = passwordSchema.safeParse(form.password);
      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Senha inválida.");
        return;
      }
    } else {
      if (!form.password) {
        setFormError("Informe sua senha.");
        return;
      }
    }

    setSaving(true);
    try {
      const { data } = await acceptInvitation({
        token: stage.token,
        password: form.password,
        ...(stage.accountExists ? {} : { username: form.username }),
      });
      setStage({ name: "done", email: data.email, verifyEmail: data.verifyEmail });
    } catch (err) {
      setFormError(apiErrorMessage(err, "Erro ao aceitar o convite. Tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  if (stage.name === "loading") {
    return <p className="text-center text-text-secondary">Verificando convite...</p>;
  }

  if (stage.name === "error") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-danger">{stage.message}</p>
        <Link href="/login" className="text-sm text-accent hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  if (stage.name === "done") {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-full mx-auto flex h-12 w-12 items-center justify-center bg-green-100 text-green-600">
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Convite aceito!</h2>
        {stage.verifyEmail ? (
          <p className="text-sm text-text-secondary">
            Enviamos um e-mail de verificação para{" "}
            <strong>{stage.email}</strong>. Confirme seu e-mail antes de entrar.
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            Sua conta foi ativada. Agora você pode entrar no CondoGuard.
          </p>
        )}
        <Button onClick={() => router.push("/login")}>Ir para o login</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleAccept} className="space-y-4">
      <div className="rounded-md border border-border bg-surface-alt px-4 py-3 text-sm">
        <p className="text-text-muted">Condomínio</p>
        <p className="font-medium text-text-primary">{stage.condominiumName}</p>
        <p className="mt-1 text-text-muted">Você está sendo convidado como</p>
        <p className="font-medium text-text-primary">{stage.personName}</p>
        <p className="mt-1 text-text-muted">E-mail: {stage.email}</p>
      </div>

      {!stage.accountExists ? (
        <>
          <p className="text-sm text-text-secondary">
            Este e-mail não tem conta. Crie uma senha para ativar seu acesso.
          </p>
          <Input
            id="invite-username"
            label="Nome de usuário"
            placeholder="minimo 3 caracteres"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
            autoFocus
          />
          <Input
            id="invite-password"
            label="Senha"
            type="password"
            placeholder="Mínimo 10 caracteres com letras e números"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
          <Input
            id="invite-confirm"
            label="Confirmar senha"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
          />
        </>
      ) : (
        <>
          <p className="text-sm text-text-secondary">
            Este e-mail já tem uma conta. Informe sua senha para vincular ao condomínio.
          </p>
          <Input
            id="invite-password"
            label="Senha"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            autoFocus
          />
        </>
      )}

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}

      <Button type="submit" className="w-full" loading={saving}>
        Aceitar convite
      </Button>

      <p className="text-center text-xs text-text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

function ConvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-xl bg-sidebar px-8 py-5">
            <Image src="/logo.svg" alt="CondoGuard" width={180} height={72} priority />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8 shadow-lg">
          <h1 className="mb-6 text-center text-xl font-bold text-text-primary">
            Convite de acesso
          </h1>
          <Suspense fallback={<p className="text-center text-text-secondary">Carregando...</p>}>
            <ConviteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ConvitePage;
