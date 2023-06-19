import { PageBase } from '@dogu-private/console';

export class Page<T> implements PageBase<T> {
  page: number;
  offset: number;
  totalCount: number;
  totalPage: number;
  items: T[];
  constructor(page: number, offset: number, totalCount: number, items: T[]) {
    this.page = page;
    this.offset = offset;
    this.totalCount = Number(totalCount);
    this.totalPage = Math.ceil(totalCount / offset);
    this.items = items;
  }
}

export const EMPTY_PAGE = new Page(0, 0, 0, []);
