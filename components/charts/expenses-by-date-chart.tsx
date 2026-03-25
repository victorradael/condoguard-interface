"use client";

import "chartjs-adapter-date-fns";
import type { Expense } from "@/types";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  expenses: Expense[];
}

export function ExpensesByDateChart({ expenses }: Props) {
  const sorted = [...expenses].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const grouped = sorted.reduce<Record<string, number>>((acc, expense) => {
    const date = expense.dueDate.split("T")[0];
    acc[date] = (acc[date] ?? 0) + expense.amountCents / 100;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(grouped),
    datasets: [
      {
        label: "Total (R$)",
        data: Object.values(grouped),
        borderColor: "rgba(52, 152, 219, 1)",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
        fill: true,
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
      x: {
        type: "time" as const,
        time: { unit: "month" as const },
      },
      y: {
        ticks: {
          callback: (value: number | string) =>
            `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
