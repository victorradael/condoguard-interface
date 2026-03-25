"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function CreateAccountPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      router.push("/login");
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-text-primary">Criar conta</h2>

      {error ? (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="username"
          name="username"
          label="Usuário"
          type="text"
          placeholder="Seu nome de usuário"
          value={form.username}
          onChange={handleChange}
          required
        />
        <Input
          id="email"
          name="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          id="password"
          name="password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Fazer login
        </Link>
      </p>
    </>
  );
}

export default CreateAccountPage;
