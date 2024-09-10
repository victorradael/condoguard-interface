"use client";

import React, { useState, useEffect } from "react";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
} from "../../services/authService";
import ExpensesChart from "../../components/ExpensesChart";
import ExpensesByDateChart from "../../components/ExpensesByDateChart";
import Papa from "papaparse"; // Importa a biblioteca para ler CSV

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
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
        setExpenses(data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError("Erro ao buscar despesas.");
      }
    };

    fetchData();
  }, []);

  const expenseTypes = [
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

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    complete: async (results) => {
      const expensesFromCSV = results.data;
      try {
        for (const expense of expensesFromCSV) {
          // Verifica se o campo de data existe
          console.log(expense)
          if (!expense.date) {
            throw new Error(`Data inválida encontrada no CSV: ${expense.date}`);
          }

          // Tenta converter a data para o formato ISO usando o construtor Date
          const parsedDate = new Date(expense.date);

          // Verifica se a data é válida
          if (isNaN(parsedDate.getTime())) {
            throw new Error(`Data inválida encontrada no CSV: ${expense.date}`);
          }

          // Processa o valor, removendo o símbolo de moeda e substituindo a vírgula por ponto
          const parsedAmount = parseFloat(
            expense.amount
              .replace("R$", "")
              .replace(".", "")
              .replace(",", ".")
              .trim()
          );

          // Faz a chamada de criação para cada despesa
          await createExpense({
            description: expense.description,
            amount: parsedAmount,
            date: parsedDate.toISOString(),
          });
        }

        // Recarrega as despesas após o upload
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (err) {
        console.error("Erro ao processar CSV:", err);
        setError(
          "Erro ao processar CSV. Verifique o formato das datas e valores."
        );
      }
    },
  });
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
            {expenseTypes.map((type) => (
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
