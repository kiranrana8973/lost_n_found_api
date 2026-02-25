export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    success: true,
    count: data.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data,
  };
}
