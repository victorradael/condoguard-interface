"use client";

import type { Page } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export const PAGE_SIZE = 12;

// Carrega uma listagem paginada ({ items, page, pageSize, total }) da API.
export function usePagedList<T>(
  fetchPage: (page: number, pageSize: number) => Promise<{ data: Page<T> }>,
  errorMessage: string
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const reload = useCallback(
    async (target = page) => {
      setLoading(true);
      try {
        const { data } = await fetchRef.current(target, PAGE_SIZE);
        setItems(data.items);
        setTotal(data.total);
        setError(null);
      } catch {
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [page, errorMessage]
  );

  useEffect(() => {
    reload(page);
  }, [page, reload]);

  return { items, page, setPage, total, pageSize: PAGE_SIZE, error, setError, loading, reload };
}
