"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createExpense, deleteExpense, fetchExpenses, fetchResidents, fetchShopOwners } from "@/lib/api";
import { EXPENSE_DESCRIPTIONS, type Expense, type Resident, type ShopOwner } from "@/types";
import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const CSV_SCHEMA = z.object({
  description: z.string(),
  amount: z.string(),
  dueDate: z.string(),
  residentId: z.string().optional(),
  shopOwnerId: z.string().optional(),
});

const ITEMS_PER_PAGE = 9;

// Converte reais (string) → centavos (int)
const toCents = (value: string) => Math.round(Number.parseFloat(value) * 100);
// Converte centavos → reais formatado
const fromCents = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type SortField = "description" | "amountCents" | "dueDate";
type SortDir = "asc" | "desc";

const filterOptions = [
  { value: "", label: "Todos os tipos" },
  ...EXPENSE_DESCRIPTIONS.map((d) => ({ value: d, label: d })),
];

const descriptionOptions = [
  { value: "", label: "Selecione um tipo" },
  ...EXPENSE_DESCRIPTIONS.map((d) => ({ value: d, label: d })),
];

type LinkType = "residentId" | "shopOwnerId";

function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    dueDate: "",
    linkType: "residentId" as LinkType,
    linkId: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const loadExpenses = async () => {
    try {
      const { data } = await fetchExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      setError("Erro ao buscar despesas.");
    }
  };

  useEffect(() => {
    loadExpenses();
    fetchResidents().then(({ data }) => setResidents(Array.isArray(data) ? data : [])).catch(() => {});
    fetchShopOwners().then(({ data }) => setShopOwners(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const residentOptions = [
    { value: "", label: "Selecione um morador" },
    ...residents.map((r) => ({ value: r.id, label: r.name })),
  ];

  const shopOwnerOptions = [
    { value: "", label: "Selecione um lojista" },
    ...shopOwners.map((s) => ({ value: s.id, label: s.name })),
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return [...expenses]
      .filter(
        (e) =>
          (!filterType || e.description === filterType) &&
          (!term ||
            e.description.toLowerCase().includes(term) ||
            String(e.amountCents).includes(term) ||
            e.dueDate.includes(term))
      )
      .sort((a, b) => {
        const av = a[sortField];
        const bv = b[sortField];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [expenses, filterType, searchTerm, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cents = toCents(form.amount);
    if (Number.isNaN(cents) || cents < 0) {
      setError("O valor não pode ser negativo.");
      return;
    }

    setLoading(true);
    try {
      await createExpense({
        description: form.description,
        amountCents: cents,
        dueDate: new Date(form.dueDate).toISOString(),
        [form.linkType]: form.linkId,
      });
      setForm({ description: "", amount: "", dueDate: "", linkType: "residentId", linkId: "" });
      await loadExpenses();
    } catch {
      setError("Erro ao criar despesa.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Erro ao deletar despesa.");
    }
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const result = await new Promise<Papa.ParseResult<unknown>>((resolve, reject) =>
        Papa.parse(file, { header: true, complete: resolve, error: reject })
      );

      const rows = z.array(CSV_SCHEMA).parse(result.data);
      for (const row of rows) {
        const parsedDate = new Date(row.dueDate);
        const parsedAmount = Number.parseFloat(row.amount.replace(/[^\d.,]/g, "").replace(",", "."));

        if (Number.isNaN(parsedDate.getTime())) throw new Error(`Data inválida: ${row.dueDate}`);
        if (Number.isNaN(parsedAmount) || parsedAmount < 0)
          throw new Error(`Valor inválido: ${row.amount}`);
        if (!row.residentId && !row.shopOwnerId)
          throw new Error(`Linha sem residentId nem shopOwnerId: ${row.description}`);

        await createExpense({
          description: row.description,
          amountCents: Math.round(parsedAmount * 100),
          dueDate: parsedDate.toISOString(),
          residentId: row.residentId,
          shopOwnerId: row.shopOwnerId,
        });
      }
      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar CSV.");
    }

    e.target.value = "";
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span> : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Despesas</h1>
        <p className="mt-1 text-sm text-text-secondary">Gerencie as despesas do condomínio</p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {/* Add expense form */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <h2 className="mb-4 text-base font-semibold text-text-primary">Nova Despesa</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Tipo"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              options={descriptionOptions}
              required
            />
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              required
            />
            <Input
              label="Vencimento"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              required
            />
          </div>

          {/* Link to resident or shop owner */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Vincular a"
              value={form.linkType}
              onChange={(e) =>
                setForm((p) => ({ ...p, linkType: e.target.value as LinkType, linkId: "" }))
              }
              options={[
                { value: "residentId", label: "Morador" },
                { value: "shopOwnerId", label: "Lojista" },
              ]}
            />
            <div className="sm:col-span-2">
              {form.linkType === "residentId" ? (
                <Select
                  label="Morador"
                  value={form.linkId}
                  onChange={(e) => setForm((p) => ({ ...p, linkId: e.target.value }))}
                  options={residentOptions}
                  required
                />
              ) : (
                <Select
                  label="Lojista"
                  value={form.linkId}
                  onChange={(e) => setForm((p) => ({ ...p, linkId: e.target.value }))}
                  options={shopOwnerOptions}
                  required
                />
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Adicionar despesa
            </Button>
          </div>
        </form>
      </div>

      {/* CSV upload */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">Importar CSV</h2>
        <p className="mb-3 text-xs text-text-muted">
          Colunas obrigatórias:{" "}
          <code className="rounded bg-slate-100 px-1">
            description, amount, dueDate, residentId | shopOwnerId
          </code>
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSV}
          className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Pesquisar despesas..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="sm:max-w-xs"
          />
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            options={filterOptions}
            className="sm:max-w-48"
          />
          <span className="ml-auto text-sm text-text-muted">{filtered.length} registro(s)</span>
        </div>

        {paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-alt text-left text-text-secondary">
                    <th
                      className="cursor-pointer px-4 py-3 font-medium hover:text-text-primary"
                      onClick={() => handleSort("description")}
                    >
                      Descrição <SortIcon field="description" />
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 font-medium hover:text-text-primary"
                      onClick={() => handleSort("amountCents")}
                    >
                      Valor <SortIcon field="amountCents" />
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 font-medium hover:text-text-primary"
                      onClick={() => handleSort("dueDate")}
                    >
                      Vencimento <SortIcon field="dueDate" />
                    </th>
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((expense) => (
                    <tr key={expense.id} className="hover:bg-surface-alt">
                      <td className="px-4 py-3 text-text-primary">{expense.description}</td>
                      <td className="px-4 py-3 text-text-primary">{fromCents(expense.amountCents)}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(expense.dueDate).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button className="text-accent hover:underline">Editar</button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-danger hover:underline"
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-text-secondary">
                {currentPage} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </>
        ) : (
          <p className="px-4 py-8 text-center text-text-secondary">Nenhuma despesa encontrada.</p>
        )}
      </div>
    </div>
  );
}

export default ExpensesPage;
