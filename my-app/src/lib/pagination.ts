// Default number of records shown on paginated user pages.
export const DEFAULT_PAGE_SIZE = 6;

// Common pagination details used by the Pagination component.
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  startItem: number;
  endItem: number;
}

// Converts total records into the number of pages required.
export function getPageCount(total: number, pageSize: number): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

// Keeps the requested page inside the valid range.
export function clampPage(page: number, total: number, pageSize: number): number {
  return Math.min(Math.max(page, 1), getPageCount(total, pageSize));
}

// Returns only the records for the current page plus display metadata.
export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize = DEFAULT_PAGE_SIZE
): { items: T[]; state: PaginationState } {
  const safePage = clampPage(page, items.length, pageSize);
  const start = (safePage - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize);
  const endItem = items.length === 0 ? 0 : Math.min(start + pageSize, items.length);

  return {
    items: pagedItems,
    state: {
      page: safePage,
      pageSize,
      total: items.length,
      pageCount: getPageCount(items.length, pageSize),
      startItem: items.length === 0 ? 0 : start + 1,
      endItem,
    },
  };
}
