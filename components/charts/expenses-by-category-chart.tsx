"use client";

import type { Expense } from "@/types";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  expenses: Expense[];
}

export function ExpensesByCategoryChart({ expenses }: Props) {
  const grouped = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.description] = (acc[expense.description] ?? 0) + expense.amountCents / 100;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(grouped),
    datasets: [
      {
        label: "Total (R$)",
        data: Object.values(grouped),
        backgroundColor: "rgba(52, 152, 219, 0.7)",
        borderColor: "rgba(52, 152, 219, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number | string) =>
            `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
