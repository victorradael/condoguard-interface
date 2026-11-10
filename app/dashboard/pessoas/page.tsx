"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pager } from "@/components/ui/pager";
import { useAuth } from "@/contexts/auth-context";
import { PAGE_SIZE, usePagedList } from "@/hooks/use-paged-list";
import { createPerson, deletePerson, fetchPeople, updatePerson } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { hasCpfReadRole, hasWriteRole } from "@/lib/session";
import type { Person } from "@/types";
import Link from "next/link";
import { useCallback, useState } from "react";

function maskCpf(cpf: string | null | undefined): string {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return "***.***.***-**";
  return `***.***.•••-**`;
}

function PessoasPage() {
  const { user } = useAuth();
  const canWrite = hasWriteRole(user?.roles);
  const canSeeCpf = hasCpfReadRole(user?.roles);

  const [q, setQ] = useState("");
  const [inputQ, setInputQ] = useState("");

  const fetchPage = useCallback(
    (page: number, pageSize: number) => fetchPeople(page, pageSize, q || undefined),
    [q]
  );

  const { items, page, setPage, total, pageSize, error, setError, loading, reload } =
    usePagedList(fetchPage, "Erro ao buscar pessoas.");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(inputQ);
    setPage(1);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [form, setForm] = useState({ fullName: "", cpf: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ fullName: "", cpf: "", email: "", phone: "" });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (person: Person) => {
    setEditing(person);
    setForm({
      fullName: person.fullName,
      cpf: person.cpf ?? "",
      email: person.email ?? "",
      phone: person.phone ?? "",
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const payload = {
      fullName: form.fullName,
      ...(form.cpf ? { cpf: form.cpf } : {}),
      ...(form.email ? { email: form.email } : {}),
      ...(form.phone ? { phone: form.phone } : {}),
    };
    try {
      if (editing) {
        await updatePerson(editing.id, payload);
      } else {
        await createPerson(payload);
      }
      closeDialog();
      await reload(page);
    } catch (err) {
      setFormError(
        apiErrorMessage(err, editing ? "Erro ao atualizar pessoa." : "Erro ao criar pessoa.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta pessoa? Esta ação é irreversível.")) return;
    try {
      await deletePerson(id);
      const target = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(target);
      await reload(target);
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao excluir pessoa."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pessoas</h1>
          <p className="mt-1 text-sm text-text-secondary">Moradores e proprietários cadastrados</p>
        </div>
        {canWrite ? (
          <Button onClick={openCreate}>Nova pessoa</Button>
        ) : null}
      </div>

      <form onSubmit={handleSearch} className="flex max-w-sm gap-2">
        <Input
          id="search-q"
          label=""
          placeholder="Buscar por nome..."
          value={inputQ}
          onChange={(e) => setInputQ(e.target.value)}
        />
        <Button type="submit" size="md">
          Buscar
        </Button>
      </form>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-12 text-center text-text-secondary">Carregando...</div>
      ) : items.length > 0 ? (
        <Card>
          <div className="divide-y divide-border">
            {items.map((person) => (
              <div key={person.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-text-primary">{person.fullName}</p>
                  {canSeeCpf && person.cpf ? (
                    <p className="mt-0.5 text-xs text-text-muted">CPF: {person.cpf}</p>
                  ) : !canSeeCpf && person.cpf ? (
                    <p className="mt-0.5 text-xs text-text-muted">CPF: {maskCpf(person.cpf)}</p>
                  ) : null}
                  {person.email ? (
                    <p className="mt-0.5 text-xs text-text-muted">{person.email}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-3">
                  <Link
                    href={`/dashboard/pessoas/${person.id}`}
                    className="text-sm text-accent hover:underline"
                  >
                    Detalhes
                  </Link>
                  {canWrite ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(person)}
                        className="text-sm text-accent hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(person.id)}
                        className="text-sm text-danger hover:underline"
                      >
                        Excluir
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-center text-text-secondary">
            {q ? "Nenhuma pessoa encontrada para esta busca." : "Nenhuma pessoa cadastrada."}
          </p>
        </Card>
      )}

      {total > pageSize ? (
        <Pager page={page} pageSize={pageSize} total={total} onChange={setPage} />
      ) : null}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? "Editar pessoa" : "Nova pessoa"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="person-name"
            label="Nome completo"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            required
            autoFocus
          />
          <Input
            id="person-cpf"
            label="CPF (opcional)"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
          />
          <Input
            id="person-email"
            label="E-mail (opcional)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            id="person-phone"
            label="Telefone (opcional)"
            type="tel"
            placeholder="(11) 90000-0000"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default PessoasPage;
