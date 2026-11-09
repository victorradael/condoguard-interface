"use client";

import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type VerifyState = "loading" | "success" | "error" | "no-token";

function VerifyEmailForm() {
  const [state, setState] = useState<VerifyState>("loading");
  const router = useRouter();
  const token = useSearchParams().get("token");

  useEffect(() => {
    if (!token) {
      setState("no-token");
      return;
    }
    verifyEmail(token)
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [token]);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-text-secondary">Verificando e-mail…</p>
      </div>
    );
  }

  if (state === "no-token") {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Link inválido</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Use o link de verificação enviado para o seu e-mail.
        </p>
        <Link href="/login" className="text-sm text-accent hover:underline">
          Ir para o login
        </Link>
      </>
    );
  }

  if (state === "success") {
    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">E-mail verificado!</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Sua conta foi confirmada. Você já pode entrar.
        </p>
        <Button onClick={() => router.push("/login")} className="w-full">
          Ir para o login
        </Button>
      </>
    );
  }

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold text-text-primary">Link inválido ou expirado</h2>
      <p className="mb-6 text-sm text-text-secondary">
        O link de verificação expirou ou já foi usado. Faça login e solicite um novo.
      </p>
      <Link href="/login" className="text-sm text-accent hover:underline">
        Ir para o login
      </Link>
    </>
  );
}

function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}

export default VerifyEmailPage;
