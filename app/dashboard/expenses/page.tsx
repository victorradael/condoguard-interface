'use client';

import React, { useState, useEffect } from 'react';
import { fetchExpenses, createExpense } from '../../services/authService';
import ExpensesChart from '../../components/ExpensesChart';
import ExpensesByDateChart from '../../components/ExpensesByDateChart';

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, date: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError('Erro ao buscar despesas.');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewExpense({
      ...newExpense,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdExpense = await createExpense(newExpense);
      setExpenses([...expenses, createdExpense]);
      setNewExpense({ description: '', amount: 0, date: '' }); // Resetar o formulário após criação
    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Erro ao criar despesa.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Despesas</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Formulário para criar nova despesa */}
      <form onSubmit={handleCreateExpense} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700">Descrição:</label>
          <input
            type="text"
            name="description"
            value={newExpense.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Valor:</label>
          <input
            type="number"
            name="amount"
            value={newExpense.amount}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Data:</label>
          <input
            type="datetime-local"
            name="date"
            value={newExpense.date}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Criar Despesa
        </button>
      </form>

      {expenses.length > 0 ? (
        <>
          {/* Exibir gráfico das despesas por categoria */}
          <ExpensesChart expenses={expenses} />

          {/* Exibir gráfico das despesas por data */}
          <ExpensesByDateChart expenses={expenses} />

          {/* Lista de despesas */}
          <ul>
            {expenses.map((expense) => (
              <li key={expense.id} className="bg-white p-4 rounded shadow-md mb-4">
                <p><strong>ID:</strong> {expense.id}</p>
                <p><strong>Descrição:</strong> {expense.description}</p>
                <p><strong>Valor:</strong> {expense.amount}</p>
                <p><strong>Data:</strong> {expense.date}</p>
                {/* Botões para editar ou deletar despesa */}
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
