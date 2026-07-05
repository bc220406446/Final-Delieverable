
import { JSX } from "react";

interface Props {
  page: number;
  pageCount: number;
  total: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
}

function pageNumbers(page: number, pageCount: number): number[] {
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
}

export default function Pagination({
  page,
  pageCount,
  total,
  startItem,
  endItem,
  onPageChange,
}: Props): JSX.Element | null {
  if (total === 0 || pageCount <= 1) return null;

  const btnBase = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{startItem}</span>-
        <span className="font-semibold text-gray-700">{endItem}</span> of{" "}
        <span className="font-semibold text-gray-700">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
        >
          Prev
        </button>

        {pageNumbers(page, pageCount).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            className={`${btnBase} ${
              n === page
                ? "border-green-600 bg-green-600 text-white"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
