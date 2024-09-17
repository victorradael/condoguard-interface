// app/dashboard/shopOwners/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchShopOwners } from '../../services/authService';

const ShopOwnersPage = () => {
  const [shopOwners, setShopOwners] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchShopOwners();
        setShopOwners(data);
      } catch (err) {
        console.error('Error fetching shop owners:', err);
        setError('Erro ao buscar lojas.');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Lojas</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {shopOwners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopOwners.map((shopOwner) => (
            <div key={shopOwner.id} className="bg-gray-50 p-4 rounded-md shadow">
              <p className="font-semibold">{shopOwner.name}</p>
              <p className="text-sm text-gray-600">{shopOwner.address}</p>
              <div className="mt-2">
                <button className="text-blue-500 hover:underline mr-2">Editar</button>
                <button className="text-red-500 hover:underline">Deletar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma loja encontrada.</p>
      )}
    </div>
  );
};

export default ShopOwnersPage;
