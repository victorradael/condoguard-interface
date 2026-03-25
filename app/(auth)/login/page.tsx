"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { login } from "@/lib/api";
import type { UserRole } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await login(username, password);
      setAuth(data.token, data.role as UserRole);
      router.push("/dashboard");
    } catch {
      setError("Usuário ou senha inválidos.");
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
          id="username"
          label="Usuário"
          type="text"
          placeholder="Seu nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
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

export default LoginPage;
