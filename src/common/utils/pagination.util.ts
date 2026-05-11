export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Cursor-based pagination for messages.
 * Sorted by createdAt DESC (newest first).
 */
export function buildCursorPagination(cursor?: string, limit = 50) {
  const take = Math.min(limit, 100);
  return {
    take,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: 'desc' as const },
  };
}

/**
 * Offset-based pagination for conversations / notifications.
 */
export function buildOffsetPagination(page = 1, limit = 20) {
  const take = Math.min(limit, 100);
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip };
}
