// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchProtectedData, fetchNotifications, fetchExpenses } from '../services/authService';

const DashboardPage = () => {
  const [overview, setOverview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [protectedData, notifications, expenses] = await Promise.all([
          fetchProtectedData(),
          fetchNotifications(),
          fetchExpenses()
        ]);

        setOverview({
          users: protectedData.users.length,
          residents: protectedData.residents.length,
          shopOwners: protectedData.shopOwners.length,
          notifications: notifications.length,
          expenses: expenses.length
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erro ao buscar dados.');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Resumo do Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Exibe resumos de cada categoria */}
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-semibold">Usuários</h3>
            <p>{overview.users}</p>
          </div>
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-semibold">Residências</h3>
            <p>{overview.residents}</p>
          </div>
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-semibold">Lojas</h3>
            <p>{overview.shopOwners}</p>
          </div>
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-semibold">Notificações</h3>
            <p>{overview.notifications}</p>
          </div>
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-semibold">Despesas</h3>
            <p>{overview.expenses}</p>
          </div>
        </div>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default DashboardPage;
