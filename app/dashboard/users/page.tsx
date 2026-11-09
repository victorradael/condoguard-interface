"use client";

import { Card } from "@/components/ui/card";
import { Pager } from "@/components/ui/pager";
import { usePagedList } from "@/hooks/use-paged-list";
import { deleteUser, fetchUsers } from "@/lib/api";

function UsersPage() {
  const {
    items: users,
    page,
    setPage,
    total,
    pageSize,
    error,
    setError,
    loading,
    reload,
  } = usePagedList(fetchUsers, "Erro ao buscar usuários.");

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      // volta uma página se a última ficou vazia
      const target = users.length === 1 && page > 1 ? page - 1 : page;
      setPage(target);
      await reload(target);
    } catch {
      setError("Erro ao deletar usuário.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Usuários</h1>
        <p className="mt-1 text-sm text-text-secondary">Gerenciamento de usuários do sistema</p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-12 text-center text-text-secondary">Carregando...</div>
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-text-primary">{user.username}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{user.email}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" className="text-sm text-accent hover:underline">
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    className="text-sm text-danger hover:underline"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-text-secondary">Nenhum usuário encontrado.</p>
        </Card>
      )}
      {total > pageSize ? (
        <Pager page={page} pageSize={pageSize} total={total} onChange={setPage} />
      ) : null}
    </div>
  );
}

export default UsersPage;
