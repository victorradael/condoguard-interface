"use client";

import React, { useState, useEffect } from "react";
import {
  fetchExpenses
} from "../services/authService";
import ExpensesChart from "../components/ExpensesChart";
import ExpensesByDateChart from "../components/ExpensesByDateChart";


const DashboardPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchExpenses();
        if (Array.isArray(data)) {
          setExpenses(data);
        } else {
          throw new Error("Dados recebidos não são um array");
        }
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError("Erro ao buscar despesas.");
      }
    };

    fetchData();
  }, []);



  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#2c3e50]">Dashboard</h1>
      {error && <p className="text-[#e74c3c] mb-4">{error}</p>}

      {expenses.length > 0 ? (
        <>
          {/* Exibir gráfico das despesas por categoria */}
          <ExpensesChart expenses={expenses} />

          {/* Exibir gráfico das despesas por data */}
          <ExpensesByDateChart expenses={expenses} />
        </>
      ) : (
        <p className="text-[#34495e]">Nenhuma despesa encontrada.</p>
      )}
    </div>
  );
};

export default DashboardPage;
