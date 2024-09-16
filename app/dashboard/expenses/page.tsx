"use client";

import React, { useState, useEffect } from "react";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
} from "../../services/authService";
import Papa from "papaparse";
import { z } from "zod";

// Define a schema for CSV expense data
const CSVExpenseSchema = z.object({
  description: z.string(),
  amount: z.string(),
  date: z.string(),
});

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: 0,
    date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchExpenses();
        if (Array.isArray(data)) {
          setExpenses(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setError("Erro ao buscar despesas: formato de dados inválido.");
        }
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError("Erro ao buscar despesas.");
      }
    };

    fetchData();
  }, []);

  const EXPENSE_TYPES = [
    "Conta de Água",
    "Conta de Luz",
    "Condomínio",
    "Internet",
    "Manutenção",
    "Outros",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const numericValue = value.replace(/\D/g, "");
      const floatValue = parseFloat(numericValue) / 100;
      setNewExpense({ ...newExpense, [name]: floatValue });
    } else {
      setNewExpense({ ...newExpense, [name]: value });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewExpense({ ...newExpense, date: e.target.value });
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdExpense = await createExpense(newExpense);
      setExpenses([...expenses, createdExpense]);
      setNewExpense({ description: "", amount: 0, date: "" });
    } catch (err) {
      console.error("Error creating expense:", err);
      setError("Erro ao criar despesa.");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError("Erro ao deletar despesa.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const results = await new Promise<Papa.ParseResult<unknown>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          complete: resolve,
          error: reject,
        });
      });

      const expensesFromCSV = z.array(CSVExpenseSchema).parse(results.data);

      for (const expense of expensesFromCSV) {
        const parsedDate = new Date(expense.date);
        if (isNaN(parsedDate.getTime())) {
          throw new Error(`Invalid date in CSV: ${expense.date}`);
        }

        const parsedAmount = parseFloat(expense.amount.replace(/[^\d.,]/g, '').replace(',', '.'));
        if (isNaN(parsedAmount)) {
          throw new Error(`Invalid amount in CSV: ${expense.amount}`);
        }

        await createExpense({
          description: expense.description,
          amount: parsedAmount,
          date: parsedDate.toISOString(),
        });
      }
      const updatedExpenses = await fetchExpenses();
      setExpenses(updatedExpenses);
    } catch (err) {
      console.error("Error processing CSV:", err);
      setError("Error processing CSV. Please check the date and amount formats.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Despesas</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Upload de CSV */}
      <div className="mb-6">
        <label className="block text-gray-700">Upload de CSV:</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Formulário para criar nova despesa */}
      <form onSubmit={handleCreateExpense} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700">Tipo de Despesa:</label>
          <select
            name="description"
            value={newExpense.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Selecione um tipo de despesa</option>
            {EXPENSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Valor:</label>
          <input
            type="text"
            name="amount"
            value={newExpense.amount.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Data:</label>
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleDateChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Criar Despesa
        </button>
      </form>

      {expenses.length > 0 ? (
        <>
          {/* Lista de despesas */}
          <ul>
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="bg-white p-4 rounded shadow-md mb-4 flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>ID:</strong> {expense.id}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {expense.description}
                  </p>
                  <p>
                    <strong>Valor:</strong>{" "}
                    {expense.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(expense.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Deletar
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Nenhuma despesa encontrada.</p>
      )}
    </div>
  );
};

export default ExpensesPage;
