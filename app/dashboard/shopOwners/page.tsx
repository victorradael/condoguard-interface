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
    <div>
      <h1 className="text-2xl font-bold mb-6">Lojas</h1>
      {error && <p className="text-red-500">{error}</p>}
      {shopOwners.length > 0 ? (
        <ul>
          {shopOwners.map((shopOwner) => (
            <li key={shopOwner.id} className="bg-white p-4 rounded shadow-md mb-4">
              <p><strong>ID:</strong> {shopOwner.id}</p>
              <p><strong>Nome:</strong> {shopOwner.name}</p>
              <p><strong>Endereço:</strong> {shopOwner.address}</p>
              {/* Botões para editar ou deletar loja */}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma loja encontrada.</p>
      )}
    </div>
  );
};

export default ShopOwnersPage;
