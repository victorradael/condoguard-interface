// app/dashboard/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchUsers } from '../../services/authService';

interface User {
  id: string;
  username: string;
  email: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
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
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#2c3e50]">Gerenciar Usuários</h1>
      {error && <p className="text-[#e74c3c] mb-4">{error}</p>}
      {users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-[#ecf0f1] p-4 rounded-md shadow">
              <p className="font-semibold text-[#2c3e50]">{user.username}</p>
              <p className="text-sm text-[#34495e]">{user.email}</p>
              <div className="mt-2">
                <button className="text-[#3498db] hover:underline mr-2">Editar</button>
                <button className="text-[#e74c3c] hover:underline">Deletar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#34495e]">Nenhum usuário encontrado.</p>
      )}
    </div>
  );
};

export default UsersPage;
