// app/dashboard/residents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchResidents } from '../../services/authService';

const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchResidents();
        setResidents(data);
      } catch (err) {
        console.error('Error fetching residents:', err);
        setError('Erro ao buscar residências.');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Residências</h1>
      {error && <p className="text-red-500">{error}</p>}
      {residents.length > 0 ? (
        <ul>
          {residents.map((resident) => (
            <li key={resident.id} className="bg-white p-4 rounded shadow-md mb-4">
              <p><strong>ID:</strong> {resident.id}</p>
              <p><strong>Nome:</strong> {resident.name}</p>
              <p><strong>Endereço:</strong> {resident.address}</p>
              {/* Botões para editar ou deletar residência */}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma residência encontrada.</p>
      )}
    </div>
  );
};

export default ResidentsPage;
