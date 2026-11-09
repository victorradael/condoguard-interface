import { Button } from "./button";

interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pager({ page, pageSize, total, onChange }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(Math.max(page - 1, 1))}
        disabled={page <= 1}
      >
        Anterior
      </Button>
      <span className="text-sm text-text-secondary">
        {page} de {totalPages} · {total} registro(s)
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(Math.min(page + 1, totalPages))}
        disabled={page >= totalPages}
      >
        Próxima
      </Button>
    </div>
  );
}
