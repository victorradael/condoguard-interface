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
    <div>
      <h1 className="text-2xl font-bold mb-6">Notificações</h1>
      {error && <p className="text-red-500">{error}</p>}
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id} className="bg-white p-4 rounded shadow-md mb-4">
              <p><strong>ID:</strong> {notification.id}</p>
              <p><strong>Título:</strong> {notification.title}</p>
              <p><strong>Mensagem:</strong> {notification.message}</p>
              {/* Botões para editar ou deletar notificação */}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma notificação encontrada.</p>
      )}
    </div>
  );
};

export default NotificationsPage;
