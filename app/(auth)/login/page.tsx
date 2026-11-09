"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import {
  enable2fa,
  login,
  resendVerificationEmail,
  setup2fa,
  verify2fa,
} from "@/lib/api";
import type { LoginCondominiumsBody } from "@/lib/api";
import { loginError } from "@/lib/errors";
import { safeNext } from "@/lib/session";
import type { CondominiumOption, LoginMfaResponse, TotpEnableResponse } from "@/types";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Stage =
  | { name: "credentials" }
  | { name: "condominium"; email: string; password: string; condominiums: CondominiumOption[] }
  | { name: "mfa-verify"; mfaToken: string }
  | { name: "mfa-enroll"; mfaToken: string }
  | { name: "mfa-setup"; mfaToken: string; qrCode: string; secret: string; otpauthUrl: string }
  | { name: "recovery-codes"; codes: string[] }
  | { name: "email-not-verified"; email: string };

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>({ name: "credentials" });
  const [totpCode, setTotpCode] = useState("");
  const [resendDone, setResendDone] = useState(false);

  const { user, reload } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await login(email, password);
      if ("mfaRequired" in data && data.mfaRequired) {
        const mfa = data as LoginMfaResponse;
        if (mfa.stage === "verify") {
          setStage({ name: "mfa-verify", mfaToken: mfa.mfaToken });
        } else {
          setStage({ name: "mfa-enroll", mfaToken: mfa.mfaToken });
        }
      } else {
        await reload();
        router.push(next);
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        const body = err.response.data as LoginCondominiumsBody;
        setStage({ name: "condominium", email, password, condominiums: body.condominiums });
      } else {
        const e = loginError(err);
        if (e.kind === "email_not_verified") {
          setStage({ name: "email-not-verified", email });
        } else {
          setError(e.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCondominiumSelect = async (condominiumId: string) => {
    if (stage.name !== "condominium") return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await login(stage.email, stage.password, condominiumId);
      if ("mfaRequired" in data && data.mfaRequired) {
        const mfa = data as LoginMfaResponse;
        if (mfa.stage === "verify") {
          setStage({ name: "mfa-verify", mfaToken: mfa.mfaToken });
        } else {
          setStage({ name: "mfa-enroll", mfaToken: mfa.mfaToken });
        }
      } else {
        await reload();
        router.push(next);
      }
    } catch (err) {
      const e = loginError(err);
      setError(e.kind === "email_not_verified" ? "E-mail não verificado." : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage.name !== "mfa-verify") return;
    setError(null);
    setLoading(true);
    try {
      await verify2fa(totpCode, stage.mfaToken);
      await reload();
      router.push(next);
    } catch {
      setError("Código inválido ou expirado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaEnrollStart = async () => {
    if (stage.name !== "mfa-enroll") return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await setup2fa(stage.mfaToken);
      setStage({
        name: "mfa-setup",
        mfaToken: stage.mfaToken,
        qrCode: data.qrCode,
        secret: data.secret,
        otpauthUrl: data.otpauthUrl,
      });
    } catch {
      setError("Não foi possível iniciar o cadastro do 2FA. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage.name !== "mfa-setup") return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await enable2fa(totpCode, stage.mfaToken);
      const result = data as TotpEnableResponse;
      setStage({ name: "recovery-codes", codes: result.recoveryCodes });
    } catch {
      setError("Código inválido. Verifique o app autenticador e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryAcknowledge = async () => {
    await reload();
    router.push(next);
  };

  const handleResendVerification = async () => {
    if (stage.name !== "email-not-verified") return;
    setLoading(true);
    try {
      await resendVerificationEmail(stage.email);
      setResendDone(true);
    } catch {
      setError("Não foi possível reenviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (stage.name === "email-not-verified") {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Confirme seu e-mail</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Sua conta precisa de verificação de e-mail antes de entrar. Verifique sua caixa de
          entrada.
        </p>
        {error ? (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
        ) : null}
        {resendDone ? (
          <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-success">
            E-mail reenviado. Verifique sua caixa de entrada.
          </div>
        ) : (
          <Button
            onClick={handleResendVerification}
            loading={loading}
            variant="secondary"
            className="w-full"
          >
            Reenviar e-mail de verificação
          </Button>
        )}
        <button
          type="button"
          onClick={() => setStage({ name: "credentials" })}
          className="mt-4 w-full text-center text-sm text-accent hover:underline"
        >
          Voltar ao login
        </button>
      </>
    );
  }

  if (stage.name === "condominium") {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Selecione o condomínio</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Sua conta está vinculada a mais de um condomínio. Escolha com qual deseja entrar.
        </p>
        {error ? (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
        ) : null}
        <div className="space-y-2">
          {stage.condominiums.map((c) => (
            <Button
              key={c.id}
              variant="secondary"
              className="w-full justify-start"
              loading={loading}
              onClick={() => handleCondominiumSelect(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setStage({ name: "credentials" })}
          className="mt-4 w-full text-center text-sm text-accent hover:underline"
        >
          Voltar
        </button>
      </>
    );
  }

  if (stage.name === "mfa-enroll") {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Autenticação em dois fatores
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          Seu papel requer autenticação em dois fatores (2FA). Configure agora para continuar.
        </p>
        {error ? (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
        ) : null}
        <Button onClick={handleMfaEnrollStart} loading={loading} className="w-full">
          Configurar 2FA
        </Button>
      </>
    );
  }

  if (stage.name === "mfa-setup") {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Configurar 2FA</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Escaneie o QR code com seu app autenticador (Google Authenticator, Authy, etc.).
        </p>
        <div className="mb-4 flex justify-center">
          <Image
            src={`data:image/png;base64,${stage.qrCode}`}
            alt="QR Code 2FA"
            width={180}
            height={180}
            unoptimized
          />
        </div>
        <details className="mb-4">
          <summary className="cursor-pointer text-xs text-text-muted">
            Não consegue escanear? Use o código manual
          </summary>
          <code className="mt-2 block break-all rounded bg-surface-alt p-2 text-xs text-text-primary">
            {stage.secret}
          </code>
        </details>
        {error ? (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
        ) : null}
        <form onSubmit={handleMfaEnable} className="space-y-4">
          <Input
            id="totp-code-setup"
            label="Código do app autenticador"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={8}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Confirmar e ativar 2FA
          </Button>
        </form>
      </>
    );
  }

  if (stage.name === "recovery-codes") {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Códigos de recuperação</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Guarde estes códigos em lugar seguro. Cada código só pode ser usado uma vez. Sem eles
          você pode perder acesso se perder o celular.
        </p>
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-md border border-border bg-surface-alt p-4">
          {stage.codes.map((code) => (
            <code key={code} className="text-center font-mono text-sm text-text-primary">
              {code}
            </code>
          ))}
        </div>
        <Button onClick={handleRecoveryAcknowledge} className="w-full">
          Salvei os códigos — continuar
        </Button>
      </>
    );
  }

  if (stage.name === "mfa-verify") {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Autenticação em dois fatores
        </h2>
        <p className="mb-4 text-sm text-text-secondary">
          Digite o código do seu app autenticador ou um código de recuperação.
        </p>
        {error ? (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
        ) : null}
        <form onSubmit={handleMfaVerify} className="space-y-4">
          <Input
            id="totp-code"
            label="Código"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={8}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Verificar
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setStage({ name: "credentials" })}
          className="mt-4 w-full text-center text-sm text-accent hover:underline"
        >
          Voltar ao login
        </button>
      </>
    );
  }

  // stage.name === "credentials"
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-text-primary">Entrar na sua conta</h2>

      {error ? (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      <form onSubmit={handleCredentials} className="space-y-4">
        <Input
          id="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link href="/recuperar-senha" className="text-sm text-accent hover:underline">
            Esqueceu a senha?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Não tem uma conta?{" "}
        <Link href="/create-account" className="font-medium text-accent hover:underline">
          Criar conta
        </Link>
      </p>
    </>
  );
}

function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

export default LoginPage;
