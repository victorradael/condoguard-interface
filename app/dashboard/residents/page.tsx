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
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Residências</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {residents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {residents.map((resident) => (
            <div key={resident.id} className="bg-gray-50 p-4 rounded-md shadow">
              <p className="font-semibold">{resident.name}</p>
              <p className="text-sm text-gray-600">{resident.address}</p>
              <div className="mt-2">
                <button className="text-blue-500 hover:underline mr-2">Editar</button>
                <button className="text-red-500 hover:underline">Deletar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma residência encontrada.</p>
      )}
    </div>
  );
};

export default ResidentsPage;
