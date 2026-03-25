"use client";

import { Card } from "@/components/ui/card";
import { fetchNotifications } from "@/lib/api";
import type { Notification } from "@/types";
import { useEffect, useState } from "react";

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications()
      .then(({ data }) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setError("Erro ao buscar notificações."))
      .finally(() => setLoading(false));
  }, []);

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
                  <p className="font-semibold text-text-primary">{n.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{n.message}</p>
                  {n.createdAt ? (
                    <p className="mt-2 text-xs text-text-muted">
                      {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  ) : null}
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
          <p className="text-center text-text-secondary">Nenhuma notificação encontrada.</p>
        </Card>
      )}
    </div>
  );
}

export default NotificationsPage;
