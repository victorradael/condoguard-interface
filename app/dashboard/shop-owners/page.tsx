"use client";

import { Card } from "@/components/ui/card";
import { fetchShopOwners } from "@/lib/api";
import type { ShopOwner } from "@/types";
import { useEffect, useState } from "react";

function ShopOwnersPage() {
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopOwners()
      .then(({ data }) => setShopOwners(Array.isArray(data) ? data : []))
      .catch(() => setError("Erro ao buscar lojistas."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Lojistas</h1>
        <p className="mt-1 text-sm text-text-secondary">Lista de lojistas do condomínio</p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-12 text-center text-text-secondary">Carregando...</div>
      ) : shopOwners.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shopOwners.map((owner) => (
            <Card key={owner.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-text-primary">{owner.name}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{owner.address}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="text-sm text-accent hover:underline">Editar</button>
                  <button className="text-sm text-danger hover:underline">Deletar</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-text-secondary">Nenhum lojista encontrado.</p>
        </Card>
      )}
    </div>
  );
}

export default ShopOwnersPage;
