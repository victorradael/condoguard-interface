"use client";

import { Card } from "@/components/ui/card";
import { Pager } from "@/components/ui/pager";
import { usePagedList } from "@/hooks/use-paged-list";
import { fetchNotifications, markNotificationRead } from "@/lib/api";

function NotificationsPage() {
  const {
    items: notifications,
    page,
    setPage,
    total,
    pageSize,
    error,
    setError,
    loading,
    reload,
  } = usePagedList(fetchNotifications, "Erro ao buscar notificações.");

  const handleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await reload();
    } catch {
      setError("Erro ao marcar notificação como lida.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Notificações</h1>
        <p className="mt-1 text-sm text-text-secondary">Comunicados e avisos do condomínio</p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-12 text-center text-text-secondary">Carregando...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={n.read ? "text-text-secondary" : "font-semibold text-text-primary"}>
                    {n.message}
                  </p>
                  {n.createdAt ? (
                    <p className="mt-2 text-xs text-text-muted">
                      {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  {n.read ? (
                    <span className="text-xs text-text-muted">Lida</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRead(n.id)}
                      className="text-sm text-accent hover:underline"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-text-secondary">Nenhuma notificação encontrada.</p>
        </Card>
      )}
      {total > pageSize ? (
        <Pager page={page} pageSize={pageSize} total={total} onChange={setPage} />
      ) : null}
    </div>
  );
}

export default NotificationsPage;
