export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;
}
