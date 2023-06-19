export interface PageBase<T> {
  page: number;
  offset: number;
  totalCount: number;
  totalPage: number;
  items: T[];
}
