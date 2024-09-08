// app/dashboard/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchUsers } from '../../services/authService';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Erro ao buscar usuários.');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gerenciar Usuários</h1>
      {error && <p className="text-red-500">{error}</p>}
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id} className="bg-white p-4 rounded shadow-md mb-4">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Nome:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              {/* Botões para editar ou deletar usuário */}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum usuário encontrado.</p>
      )}
    </div>
  );
};

export default UsersPage;
