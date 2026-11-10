"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      // A API retorna 202 independente do e-mail existir; qualquer erro aqui é inesperado.
      setError("Não foi possível enviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Verifique seu e-mail</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Se existe uma conta com esse e-mail, você receberá um link para redefinir a senha em
          breve.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-md bg-accent px-4 py-2 text-center text-sm font-medium text-white hover:bg-accent-hover"
        >
          Voltar ao login
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold text-text-primary">Recuperar senha</h2>
      <p className="mb-6 text-sm text-text-secondary">
        Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.
      </p>

      {error ? (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
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
        <Button type="submit" loading={loading} className="w-full">
          Enviar link de recuperação
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-text-secondary">
        <Link href="/login" className="text-accent hover:underline">
          Voltar ao login
        </Link>
      </p>
    </>
  );
}

export default ForgotPasswordPage;
