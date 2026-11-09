"use client";

import { Card } from "@/components/ui/card";
import { Pager } from "@/components/ui/pager";
import { usePagedList } from "@/hooks/use-paged-list";
import { fetchShopOwners } from "@/lib/api";

function ShopOwnersPage() {
  const {
    items: shopOwners,
    page,
    setPage,
    total,
    pageSize,
    error,
    loading,
  } = usePagedList(fetchShopOwners, "Erro ao buscar lojistas.");

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
                  <p className="font-semibold text-text-primary">{owner.shopName}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {owner.floor ? `${owner.floor}º andar · ` : ""}CNPJ {owner.cnpj}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" className="text-sm text-accent hover:underline">
                    Editar
                  </button>
                  <button type="button" className="text-sm text-danger hover:underline">
                    Deletar
                  </button>
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
      {total > pageSize ? (
        <Pager page={page} pageSize={pageSize} total={total} onChange={setPage} />
      ) : null}
    </div>
  );
}

export default ShopOwnersPage;
