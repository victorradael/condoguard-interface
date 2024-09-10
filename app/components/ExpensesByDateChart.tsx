"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns"; // Importa o adaptador de datas para manipulação correta de datas

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ExpensesByDateChartProps {
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
  }>;
}

const ExpensesByDateChart: React.FC<ExpensesByDateChartProps> = ({
  expenses,
}) => {
  // Agrupar despesas por data (ignorando a parte de tempo) e somar os valores
  const groupedExpenses = expenses.reduce((acc, expense) => {
    // Extrair apenas a parte da data (ano-mês-dia) e converter para um formato legível
    const date = new Date(expense.date).toISOString().split("T")[0];

    if (acc[date]) {
      acc[date] += expense.amount;
    } else {
      acc[date] = expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Extrair labels (datas) e data (valores somados) para o gráfico
  const labels = Object.keys(groupedExpenses).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const data = Object.values(groupedExpenses);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Despesas por Data",
        data,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Despesas Cadastradas por Data",
      },
    },
    scales: {
      x: {
        type: "time" as const, // Define o eixo X como um eixo de tempo
        time: {
          unit: "month", // Define a unidade de tempo (dia)
          tooltipFormat: "yyyy-MM-dd", // Formato de exibição no tooltip
        },
      },
    },
  };

  return (
    <div className="w-full md:w-2/3 lg:w-1/2 mx-auto mt-8">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default ExpensesByDateChart;
