"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import {
  createTransfer,
  createUnitLink,
  deleteUnitLink,
  endUnitLink,
  fetchAll,
  fetchPeople,
  fetchUnit,
  fetchUnitLinks,
} from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { hasWriteRole } from "@/lib/session";
import type { Person, UnitLink, UnitLinkKind } from "@/types";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

const KIND_LABELS: Record<UnitLinkKind, string> = {
  proprietario: "Proprietário",
  coproprietario: "Coproprietário",
  inquilino: "Inquilino",
  morador: "Morador",
  dependente: "Dependente",
};

const KIND_OPTIONS: { value: UnitLinkKind; label: string }[] = [
  { value: "proprietario", label: "Proprietário" },
  { value: "coproprietario", label: "Coproprietário" },
  { value: "inquilino", label: "Inquilino" },
  { value: "morador", label: "Morador" },
  { value: "dependente", label: "Dependente" },
];

function linkBadgeVariant(kind: UnitLinkKind) {
  if (kind === "proprietario") return "success";
  if (kind === "inquilino") return "warning";
  if (kind === "coproprietario") return "default";
  return "default";
}

interface PageParams {
  params: Promise<{ id: string }>;
}

function UnitDetailPage({ params }: PageParams) {
  const { id: unitId } = use(params);
  const { user } = useAuth();
  const canWrite = hasWriteRole(user?.roles);

  const [unitLabel, setUnitLabel] = useState<string>("");
  const [links, setLinks] = useState<UnitLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const [unitRes, linksRes] = await Promise.all([
        fetchUnit(unitId),
        fetchUnitLinks(unitId, showAll ? undefined : true),
      ]);
      const u = unitRes.data;
      setUnitLabel(
        `Unidade ${u.unitNumber}${u.blockName ? ` — ${u.blockName}` : ""}`
      );
      setLinks(linksRes.data.items ?? []);
      setError(null);
    } catch {
      setError("Erro ao carregar vínculos da unidade.");
    } finally {
      setLoading(false);
    }
  }, [unitId, showAll]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // Add link dialog
  const [addOpen, setAddOpen] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [addForm, setAddForm] = useState({
    personId: "",
    newName: "",
    newCpf: "",
    newEmail: "",
    kind: "morador" as UnitLinkKind,
    startsOn: "",
    endsOn: "",
    useNew: false,
  });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const openAdd = async () => {
    setAddForm({
      personId: "",
      newName: "",
      newCpf: "",
      newEmail: "",
      kind: "morador",
      startsOn: "",
      endsOn: "",
      useNew: false,
    });
    setAddError(null);
    setAddOpen(true);
    try {
      const all = await fetchAll<Person>(fetchPeople);
      setPeople(all);
    } catch {}
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError(null);
    try {
      const base = {
        kind: addForm.kind,
        ...(addForm.startsOn ? { startsOn: addForm.startsOn } : {}),
        ...(addForm.endsOn ? { endsOn: addForm.endsOn } : {}),
      };
      const body = addForm.useNew
        ? {
            ...base,
            person: {
              fullName: addForm.newName,
              ...(addForm.newCpf ? { cpf: addForm.newCpf } : {}),
              ...(addForm.newEmail ? { email: addForm.newEmail } : {}),
            },
          }
        : { ...base, personId: addForm.personId };
      await createUnitLink(unitId, body as Parameters<typeof createUnitLink>[1]);
      setAddOpen(false);
      await loadLinks();
    } catch (err) {
      setAddError(apiErrorMessage(err, "Erro ao adicionar vínculo."));
    } finally {
      setAddSaving(false);
    }
  };

  // End link
  const handleEndLink = async (link: UnitLink) => {
    const endsOn = prompt("Data de encerramento (AAAA-MM-DD, padrão: hoje):");
    if (endsOn === null) return;
    try {
      await endUnitLink(link.id, endsOn || undefined);
      await loadLinks();
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao encerrar vínculo."));
    }
  };

  // Delete link
  const handleDeleteLink = async (id: string) => {
    if (!confirm("Excluir este vínculo? (Só possível se ainda não iniciou.)")) return;
    try {
      await deleteUnitLink(id);
      await loadLinks();
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao excluir vínculo."));
    }
  };

  // Transfer dialog
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    kind: "proprietario" as "proprietario" | "inquilino",
    effectiveDate: "",
    personId: "",
    newName: "",
    newCpf: "",
    newEmail: "",
    useNew: false,
  });
  const [transferSaving, setTransferSaving] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSaving(true);
    setTransferError(null);
    try {
      const base = {
        kind: transferForm.kind,
        ...(transferForm.effectiveDate ? { effectiveDate: transferForm.effectiveDate } : {}),
      };
      const body = transferForm.useNew
        ? {
            ...base,
            person: {
              fullName: transferForm.newName,
              ...(transferForm.newCpf ? { cpf: transferForm.newCpf } : {}),
              ...(transferForm.newEmail ? { email: transferForm.newEmail } : {}),
            },
          }
        : { ...base, personId: transferForm.personId };
      await createTransfer(unitId, body);
      setTransferOpen(false);
      await loadLinks();
    } catch (err) {
      setTransferError(apiErrorMessage(err, "Erro ao registrar troca."));
    } finally {
      setTransferSaving(false);
    }
  };

  const peopleOptions = [
    { value: "", label: "Selecione uma pessoa..." },
    ...people.map((p) => ({ value: p.id, label: p.fullName })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/unidades" className="text-sm text-accent hover:underline">
          ← Unidades
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{unitLabel || "Unidade"}</h1>
          <p className="mt-1 text-sm text-text-secondary">Vínculos e histórico</p>
        </div>
        {canWrite ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setTransferOpen(true)}>
              Troca de proprietário/inquilino
            </Button>
            <Button onClick={openAdd}>Adicionar vínculo</Button>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      <div className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="rounded"
          />
          Mostrar histórico completo
        </label>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-secondary">Carregando...</div>
      ) : links.length > 0 ? (
        <Card>
          <div className="divide-y divide-border">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{link.personName}</span>
                    <Badge variant={linkBadgeVariant(link.kind)}>
                      {KIND_LABELS[link.kind]}
                    </Badge>
                    {!link.active ? (
                      <Badge variant="danger">Encerrado</Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    De {link.startsOn}
                    {link.endsOn ? ` até ${link.endsOn}` : " (ativo)"}
                  </p>
                </div>
                {canWrite && link.active ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEndLink(link)}
                      className="text-sm text-warning hover:underline"
                    >
                      Encerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-sm text-danger hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-center text-text-secondary">
            {showAll ? "Nenhum vínculo encontrado." : "Nenhum vínculo ativo."}
          </p>
        </Card>
      )}

      {/* Add Link Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Adicionar vínculo">
        <form onSubmit={handleAddLink} className="space-y-4">
          <Select
            id="add-kind"
            label="Papel"
            options={KIND_OPTIONS.map((k) => ({ value: k.value, label: k.label }))}
            value={addForm.kind}
            onChange={(e) =>
              setAddForm((f) => ({ ...f, kind: e.target.value as UnitLinkKind }))
            }
          />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={addForm.useNew}
              onChange={(e) => setAddForm((f) => ({ ...f, useNew: e.target.checked }))}
            />
            Nova pessoa (ainda não cadastrada)
          </label>
          {addForm.useNew ? (
            <>
              <Input
                id="new-name"
                label="Nome completo"
                value={addForm.newName}
                onChange={(e) => setAddForm((f) => ({ ...f, newName: e.target.value }))}
                required
              />
              <Input
                id="new-cpf"
                label="CPF (opcional)"
                placeholder="000.000.000-00"
                value={addForm.newCpf}
                onChange={(e) => setAddForm((f) => ({ ...f, newCpf: e.target.value }))}
              />
              <Input
                id="new-email"
                label="E-mail (opcional)"
                type="email"
                value={addForm.newEmail}
                onChange={(e) => setAddForm((f) => ({ ...f, newEmail: e.target.value }))}
              />
            </>
          ) : (
            <Select
              id="add-person"
              label="Pessoa"
              options={peopleOptions}
              value={addForm.personId}
              onChange={(e) => setAddForm((f) => ({ ...f, personId: e.target.value }))}
            />
          )}
          <Input
            id="add-starts"
            label="Início (padrão: hoje)"
            type="date"
            value={addForm.startsOn}
            onChange={(e) => setAddForm((f) => ({ ...f, startsOn: e.target.value }))}
          />
          <Input
            id="add-ends"
            label="Fim (opcional)"
            type="date"
            value={addForm.endsOn}
            onChange={(e) => setAddForm((f) => ({ ...f, endsOn: e.target.value }))}
          />
          {addError ? <p className="text-sm text-danger">{addError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={addSaving}>
              Adicionar
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Troca de proprietário ou inquilino"
      >
        <form onSubmit={handleTransfer} className="space-y-4">
          <Select
            id="transfer-kind"
            label="Tipo de troca"
            options={[
              { value: "proprietario", label: "Proprietário" },
              { value: "inquilino", label: "Inquilino" },
            ]}
            value={transferForm.kind}
            onChange={(e) =>
              setTransferForm((f) => ({
                ...f,
                kind: e.target.value as "proprietario" | "inquilino",
              }))
            }
          />
          <Input
            id="transfer-date"
            label="Data de vigência (padrão: hoje)"
            type="date"
            value={transferForm.effectiveDate}
            onChange={(e) => setTransferForm((f) => ({ ...f, effectiveDate: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={transferForm.useNew}
              onChange={(e) => setTransferForm((f) => ({ ...f, useNew: e.target.checked }))}
            />
            Nova pessoa (ainda não cadastrada)
          </label>
          {transferForm.useNew ? (
            <>
              <Input
                id="tr-new-name"
                label="Nome completo"
                value={transferForm.newName}
                onChange={(e) => setTransferForm((f) => ({ ...f, newName: e.target.value }))}
                required
              />
              <Input
                id="tr-new-cpf"
                label="CPF (opcional)"
                value={transferForm.newCpf}
                onChange={(e) => setTransferForm((f) => ({ ...f, newCpf: e.target.value }))}
              />
              <Input
                id="tr-new-email"
                label="E-mail (opcional)"
                type="email"
                value={transferForm.newEmail}
                onChange={(e) => setTransferForm((f) => ({ ...f, newEmail: e.target.value }))}
              />
            </>
          ) : (
            <Select
              id="tr-person"
              label="Nova pessoa"
              options={peopleOptions}
              value={transferForm.personId}
              onChange={(e) => setTransferForm((f) => ({ ...f, personId: e.target.value }))}
            />
          )}
          {transferError ? <p className="text-sm text-danger">{transferError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setTransferOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={transferSaving}>
              Registrar troca
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default UnitDetailPage;
