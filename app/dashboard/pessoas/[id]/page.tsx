"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { fetchPerson, fetchPersonInvitations, sendInvitation } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { hasCpfReadRole, hasWriteRole } from "@/lib/session";
import type { InvitationRecord, Person } from "@/types";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

const STATUS_LABELS: Record<InvitationRecord["status"], string> = {
  pending: "Pendente",
  accepted: "Aceito",
  revoked: "Revogado",
  expired: "Expirado",
};

const STATUS_VARIANTS: Record<
  InvitationRecord["status"],
  "default" | "success" | "warning" | "danger"
> = {
  pending: "warning",
  accepted: "success",
  revoked: "danger",
  expired: "default",
};

interface PageParams {
  params: Promise<{ id: string }>;
}

function PersonDetailPage({ params }: PageParams) {
  const { id: personId } = use(params);
  const { user } = useAuth();
  const canWrite = hasWriteRole(user?.roles);
  const canSeeCpf = hasCpfReadRole(user?.roles);

  const [person, setPerson] = useState<Person | null>(null);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shownToken, setShownToken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [personRes, invRes] = await Promise.all([
        fetchPerson(personId),
        fetchPersonInvitations(personId),
      ]);
      setPerson(personRes.data);
      setInvitations(invRes.data.items ?? []);
      setError(null);
    } catch {
      setError("Erro ao carregar dados da pessoa.");
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSendInvite = async (channel: "email" | "link") => {
    setSending(true);
    setSendError(null);
    setShownToken(null);
    try {
      const { data } = await sendInvitation(personId, channel);
      if (channel === "link" && data.token) {
        setShownToken(data.token);
      }
      await load();
    } catch (err) {
      setSendError(apiErrorMessage(err, "Erro ao enviar convite."));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-text-secondary">Carregando...</div>;
  }

  if (error || !person) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">
        {error ?? "Pessoa não encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/pessoas" className="text-sm text-accent hover:underline">
          ← Pessoas
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">{person.fullName}</h1>
        <p className="mt-1 text-sm text-text-secondary">Ficha pessoal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados</CardTitle>
        </CardHeader>
        <dl className="mt-2 space-y-2 text-sm">
          {person.cpf && canSeeCpf ? (
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-text-secondary">CPF</dt>
              <dd className="text-text-primary">{person.cpf}</dd>
            </div>
          ) : null}
          {person.email ? (
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-text-secondary">E-mail</dt>
              <dd className="text-text-primary">{person.email}</dd>
            </div>
          ) : null}
          {person.phone ? (
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-text-secondary">Telefone</dt>
              <dd className="text-text-primary">{person.phone}</dd>
            </div>
          ) : null}
          <div className="flex gap-2">
            <dt className="w-24 font-medium text-text-secondary">Conta</dt>
            <dd>
              {person.hasAccount ? (
                <Badge variant="success">Ativa</Badge>
              ) : (
                <Badge variant="default">Sem conta</Badge>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      {person.units && person.units.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Unidades vinculadas</CardTitle>
          </CardHeader>
          <div className="mt-2 divide-y divide-border">
            {person.units.map((u) => (
              <div key={u.linkId} className="flex items-center justify-between py-2 text-sm">
                <span className="text-text-primary">
                  {u.unitNumber}
                  {u.blockName ? ` — ${u.blockName}` : ""}
                </span>
                <span className="text-text-muted capitalize">{u.kind}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Convites</CardTitle>
          </CardHeader>
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleSendInvite("email")}
                loading={sending}
                disabled={!person.email}
                title={!person.email ? "Pessoa sem e-mail cadastrado" : undefined}
              >
                Enviar por e-mail
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleSendInvite("link")}
                loading={sending}
              >
                Gerar link/código
              </Button>
            </div>

            {sendError ? <p className="text-sm text-danger">{sendError}</p> : null}

            {shownToken ? (
              <div className="rounded-md border border-border bg-surface-alt p-3 text-sm">
                <p className="mb-1 font-medium text-text-primary">
                  Código do convite (mostrado uma única vez):
                </p>
                <code className="break-all font-mono text-xs text-text-secondary">
                  {shownToken}
                </code>
                <p className="mt-1 text-xs text-text-muted">
                  Repasse este token ao morador para que acesse a página de convite.
                </p>
              </div>
            ) : null}

            {invitations.length > 0 ? (
              <div className="mt-2 divide-y divide-border">
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-text-secondary capitalize">{inv.channel}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANTS[inv.status]}>
                        {STATUS_LABELS[inv.status]}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {new Date(inv.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Nenhum convite enviado ainda.</p>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export default PersonDetailPage;
