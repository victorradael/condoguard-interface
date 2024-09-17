"use client";

import React, { useState, useEffect } from "react";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
} from "../../services/authService";
import Papa from "papaparse";
import { z } from "zod";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

const EXPENSE_TYPES = [
  "Luz",
  "Fundo de Reserva",
  "Agua Área Comum",
  "Água",
  "Gás",
  "Outros",
] as const;

const ITEMS_PER_PAGE = 9;

const CSVExpenseSchema = z.object({
  description: z.string(),
  amount: z.string(),
  date: z.string(),
});

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: 0,
    date: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Expense>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = expenses.filter(expense => 
      (filterType === '' || expense.description === filterType) &&
      (searchTerm === '' || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm) ||
        expense.date.includes(searchTerm)
      )
    );

    const sorted = filtered.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredExpenses(sorted);
  }, [expenses, filterType, searchTerm, sortField, sortDirection]);

  const fetchData = async () => {
    try {
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Erro ao buscar despesas.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
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
      
      fetchData(); // Refresh the expenses list after adding new ones
    } catch (err) {
      console.error("Error processing CSV:", err);
      setError("Error processing CSV. Please check the date and amount formats.");
    }
  };

  const handleSort = (field: keyof Expense) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-[#ecf0f1] shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#2c3e50]">Despesas</h1>
      {error && <p className="text-[#e74c3c] mb-4">{error}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#2c3e50]">Upload de CSV</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="w-full p-2 border border-[#34495e] rounded text-[#2c3e50]"
        />
      </div>

      <form onSubmit={handleCreateExpense} className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-[#2c3e50]">Nova Despesa</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50]">Tipo de Despesa:</label>
            <select
              name="description"
              value={newExpense.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-[#34495e] shadow-sm focus:border-[#3498db] focus:ring focus:ring-[#3498db] focus:ring-opacity-50"
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
          <div>
            <label className="block text-sm font-medium text-[#2c3e50]">Valor:</label>
            <input
              type="number"
              name="amount"
              value={newExpense.amount}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-[#34495e] shadow-sm focus:border-[#3498db] focus:ring focus:ring-[#3498db] focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c3e50]">Data:</label>
            <input
              type="date"
              name="date"
              value={newExpense.date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-[#34495e] shadow-sm focus:border-[#3498db] focus:ring focus:ring-[#3498db] focus:ring-opacity-50"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-[#3498db] text-white rounded hover:bg-[#2980b9] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:ring-opacity-50"
          >
            Criar
          </button>
        </div>
      </form>

      <div className="mb-4 flex w-full items-center">
        <input
          type="text"
          placeholder="Pesquisar despesas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-[#34495e] rounded mr-2 w-full"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border border-[#34495e] rounded"
        >
          <option value="">Todos os tipos</option>
          {EXPENSE_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <h2 className="text-xl font-semibold mb-2 text-[#2c3e50]">Lista de Despesas</h2>
      {paginatedExpenses.length > 0 ? (
        <>
          <table className="w-full mb-4">
            <thead>
              <tr className="bg-[#34495e] text-white">
                <th className="p-2 cursor-pointer" onClick={() => handleSort('description')}>Descrição</th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort('amount')}>Valor</th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort('date')}>Data</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((expense) => (
                <tr key={expense.id} className="border-b border-[#34495e]">
                  <td className="p-2">{expense.description}</td>
                  <td className="p-2">
                    {expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-2">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-2">
                    <button className="text-[#3498db] hover:underline mr-2">Editar</button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-[#e74c3c] hover:underline"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#3498db] text-white rounded disabled:bg-gray-300"
            >
              Anterior
            </button>
            <span>{currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#3498db] text-white rounded disabled:bg-gray-300"
            >
              Próxima
            </button>
          </div>
        </>
      ) : (
        <p className="text-[#34495e]">Nenhuma despesa encontrada.</p>
      )}
    </div>
  );
};

export default ExpensesPage;
