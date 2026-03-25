"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchExpenses } from "@/lib/api";
import type { Expense } from "@/types";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ExpensesByCategoryChart = dynamic(
  () =>
    import("@/components/charts/expenses-by-category-chart").then(
      (m) => m.ExpensesByCategoryChart
    ),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded bg-slate-100" /> }
);

const ExpensesByDateChart = dynamic(
  () =>
    import("@/components/charts/expenses-by-date-chart").then((m) => m.ExpensesByDateChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded bg-slate-100" /> }
);

function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses()
      .then(({ data }) => setExpenses(Array.isArray(data) ? data : []))
      .catch(() => setError("Erro ao buscar despesas."))
      .finally(() => setLoading(false));
  }, []);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amountCents / 100, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">Visão geral das despesas do condomínio</p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-text-secondary">Total de despesas</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">
            {loading ? "—" : expenses.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Valor total</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">
            {loading
              ? "—"
              : totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </Card>
      </div>

      {/* Charts */}
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <ExpensesByCategoryChart expenses={expenses} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Data</CardTitle>
            </CardHeader>
            <ExpensesByDateChart expenses={expenses} />
          </Card>
        </div>
      ) : !loading ? (
        <Card>
          <p className="text-center text-text-secondary">Nenhuma despesa cadastrada.</p>
        </Card>
      ) : null}
    </div>
  );
}

export default DashboardPage;
