export type Meta<T> = {
  limit: number;
  page: number;
  total: number;
  data: T;
};

export const createPaginatedResponse = <T>({
  limit,
  page,
  total,
  data,
}: Meta<T>): Meta<T> => {
  return { limit, page, total, data };
};
