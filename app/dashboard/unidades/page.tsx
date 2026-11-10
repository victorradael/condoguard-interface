"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pager } from "@/components/ui/pager";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { PAGE_SIZE, usePagedList } from "@/hooks/use-paged-list";
import { createUnit, deleteUnit, fetchAll, fetchBlocks, fetchUnits, updateUnit } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { hasWriteRole } from "@/lib/session";
import type { Block, Unit } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function UnidadesPage() {
  const { user } = useAuth();
  const canWrite = hasWriteRole(user?.roles);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [filterBlockId, setFilterBlockId] = useState("");

  const fetchPage = useCallback(
    (page: number, pageSize: number) =>
      fetchUnits(page, pageSize, filterBlockId || undefined, "number"),
    [filterBlockId]
  );

  const { items, page, setPage, total, pageSize, error, setError, loading, reload } =
    usePagedList(fetchPage, "Erro ao buscar unidades.");

  useEffect(() => {
    fetchAll<Block>(fetchBlocks).then(setBlocks).catch(() => {});
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState({ unitNumber: "", floor: "", blockId: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ unitNumber: "", floor: "", blockId: "" });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (unit: Unit) => {
    setEditing(unit);
    setForm({
      unitNumber: unit.unitNumber,
      floor: unit.floor != null ? String(unit.floor) : "",
      blockId: unit.blockId ?? "",
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
      unitNumber: form.unitNumber,
      ...(form.floor ? { floor: Number(form.floor) } : {}),
      ...(form.blockId !== undefined ? { blockId: form.blockId || "" } : {}),
    };
    try {
      if (editing) {
        await updateUnit(editing.id, payload);
      } else {
        await createUnit(payload);
      }
      closeDialog();
      await reload(page);
    } catch (err) {
      setFormError(
        apiErrorMessage(
          err,
          editing ? "Erro ao atualizar unidade." : "Erro ao criar unidade."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta unidade?")) return;
    try {
      await deleteUnit(id);
      const target = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(target);
      await reload(target);
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao excluir unidade."));
    }
  };

  const blockOptions = [
    { value: "", label: "Todos os blocos" },
    ...blocks.map((b) => ({ value: b.id, label: b.name })),
  ];

  const formBlockOptions = [
    { value: "", label: "Sem bloco" },
    ...blocks.map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Unidades</h1>
          <p className="mt-1 text-sm text-text-secondary">Unidades do condomínio</p>
        </div>
        {canWrite ? (
          <Button onClick={openCreate}>Nova unidade</Button>
        ) : null}
      </div>

      <div className="max-w-xs">
        <Select
          id="filter-block"
          label="Filtrar por bloco"
          options={blockOptions}
          value={filterBlockId}
          onChange={(e) => {
            setFilterBlockId(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-12 text-center text-text-secondary">Carregando...</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((unit) => (
            <Card key={unit.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-text-primary">
                    Unidade {unit.unitNumber}
                    {unit.blockName ? ` — ${unit.blockName}` : ""}
                  </p>
                  {unit.floor != null ? (
                    <p className="mt-0.5 text-sm text-text-secondary">{unit.floor}º andar</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/dashboard/unidades/${unit.id}`}
                    className="text-sm text-accent hover:underline"
                  >
                    Vínculos
                  </Link>
                  {canWrite ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(unit)}
                        className="text-sm text-accent hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(unit.id)}
                        className="text-sm text-danger hover:underline"
                      >
                        Excluir
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-text-secondary">Nenhuma unidade encontrada.</p>
        </Card>
      )}

      {total > pageSize ? (
        <Pager page={page} pageSize={pageSize} total={total} onChange={setPage} />
      ) : null}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? "Editar unidade" : "Nova unidade"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="unit-number"
            label="Número da unidade"
            placeholder="Ex: 101"
            value={form.unitNumber}
            onChange={(e) => setForm((f) => ({ ...f, unitNumber: e.target.value }))}
            required
            autoFocus
          />
          <Input
            id="unit-floor"
            label="Andar (opcional)"
            type="number"
            placeholder="Ex: 1"
            value={form.floor}
            onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
          />
          <Select
            id="unit-block"
            label="Bloco (opcional)"
            options={formBlockOptions}
            value={form.blockId}
            onChange={(e) => setForm((f) => ({ ...f, blockId: e.target.value }))}
          />
          {formError ? (
            <p className="text-sm text-danger">{formError}</p>
          ) : null}
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

export default UnidadesPage;
