export interface SearchDataModel<T = any> {
  currentPage: number;
  page: Array<T>;
  totalElements: number;
  totalPages: number;
}
