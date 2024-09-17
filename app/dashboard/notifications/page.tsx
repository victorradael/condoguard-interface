// app/dashboard/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchNotifications } from '../../services/authService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Erro ao buscar notificações.');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Notificações</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-gray-50 p-4 rounded-md shadow">
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <div className="mt-2">
                <button className="text-blue-500 hover:underline mr-2">Editar</button>
                <button className="text-red-500 hover:underline">Deletar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma notificação encontrada.</p>
      )}
    </div>
  );
};

export default NotificationsPage;
