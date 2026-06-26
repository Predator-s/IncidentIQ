import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination as PaginationType } from "../types";

interface Props {
  pagination: PaginationType | null;
  onPage: (page: number) => void;
}

export default function Pagination({ pagination, onPage }: Props) {
  if (!pagination) return null;
  const { page, totalPages, total } = pagination;

  return (
    <div className="flex items-center justify-between px-1 text-sm text-slate-400">
      <span>
        <span className="font-medium text-slate-200">{total}</span> incident
        {total === 1 ? "" : "s"}
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="btn-ghost px-3 py-2"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="px-2">
          Page <span className="font-medium text-slate-200">{page}</span> of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="btn-ghost px-3 py-2"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
