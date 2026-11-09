"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { login } from "@/lib/api";
import { loginErrorMessage } from "@/lib/errors";
import { safeNext } from "@/lib/session";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, reload } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  // Sessão ainda válida (o AuthProvider já tentou o refresh): vai direto ao destino.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      await reload();
      router.push(next);
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-text-primary">Entrar na sua conta</h2>

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
