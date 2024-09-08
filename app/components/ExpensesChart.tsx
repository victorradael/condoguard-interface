'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ExpensesChartProps {
  expenses: Array<{ id: string; description: string; amount: number; date: string }>;
}

const ExpensesChart: React.FC<ExpensesChartProps> = ({ expenses }) => {
  // Agrupar despesas por descrição e somar os valores
  const groupedExpenses = expenses.reduce((acc, expense) => {
    if (acc[expense.description]) {
      acc[expense.description] += expense.amount;
    } else {
      acc[expense.description] = expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Extrair labels e data para o gráfico
  const labels = Object.keys(groupedExpenses);
  const data = Object.values(groupedExpenses);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Despesas',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Despesas Cadastradas por Categoria',
      },
    },
  };

  return (
    <div className="w-full md:w-2/3 lg:w-1/2 mx-auto mt-8">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ExpensesChart;
