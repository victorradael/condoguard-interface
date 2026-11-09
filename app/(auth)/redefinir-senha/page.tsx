"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validations";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  const router = useRouter();
  const token = useSearchParams().get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    if (!token) {
      setError("Token de redefinição ausente. Use o link enviado para o seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch {
      setError("Link inválido ou expirado. Solicite um novo link de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Link inválido</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Use o link enviado para o seu e-mail para redefinir a senha.
        </p>
        <Link href="/recuperar-senha" className="text-sm text-accent hover:underline">
          Solicitar novo link
        </Link>
      </>
    );
  }

  if (done) {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Senha redefinida</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Sua senha foi alterada com sucesso. Todas as sessões anteriores foram encerradas.
        </p>
        <Button onClick={() => router.push("/login")} className="w-full">
          Ir para o login
        </Button>
      </>
    );
  }

  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-text-primary">Redefinir senha</h2>

      {error ? (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="password"
          label="Nova senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
          autoComplete="new-password"
        />
        <Input
          id="confirmPassword"
          label="Confirmar nova senha"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          required
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} className="w-full">
          Redefinir senha
        </Button>
      </form>
    </>
  );
}

function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

export default ResetPasswordPage;
