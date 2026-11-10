"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pager } from "@/components/ui/pager";
import { useAuth } from "@/contexts/auth-context";
import { usePagedList } from "@/hooks/use-paged-list";
import { createBlock, deleteBlock, fetchBlocks, updateBlock } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { hasWriteRole } from "@/lib/session";
import type { Block } from "@/types";
import { useState } from "react";

function BlocosPage() {
  const { user } = useAuth();
  const canWrite = hasWriteRole(user?.roles);

  const { items, page, setPage, total, pageSize, error, setError, loading, reload } = usePagedList(
    fetchBlocks,
    "Erro ao buscar blocos."
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Block | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (block: Block) => {
    setEditing(block);
    setName(block.name);
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
    try {
      if (editing) {
        await updateBlock(editing.id, name);
      } else {
        await createBlock(name);
      }
      closeDialog();
      await reload(page);
    } catch (err) {
      setFormError(
        apiErrorMessage(err, editing ? "Erro ao atualizar bloco." : "Erro ao criar bloco.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este bloco? Só é possível se não tiver unidades.")) return;
    try {
      await deleteBlock(id);
      const target = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(target);
      await reload(target);
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao excluir bloco."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Blocos</h1>
          <p className="mt-1 text-sm text-text-secondary">Torres e blocos do condomínio</p>
        </div>
        {canWrite ? <Button onClick={openCreate}>Novo bloco</Button> : null}
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-12 text-center text-text-secondary">Carregando...</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((block) => (
            <Card key={block.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-text-primary">{block.name}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {block.unitCount} unidade{block.unitCount !== 1 ? "s" : ""}
                  </p>
                </div>
                {canWrite ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(block)}
                      className="text-sm text-accent hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(block.id)}
                      className="text-sm text-danger hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-text-secondary">Nenhum bloco cadastrado.</p>
        </Card>
      )}

      {total > pageSize ? (
        <Pager page={page} pageSize={pageSize} total={total} onChange={setPage} />
      ) : null}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? "Editar bloco" : "Novo bloco"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="block-name"
            label="Nome do bloco"
            placeholder="Ex: Torre A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            autoFocus
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

export default BlocosPage;
