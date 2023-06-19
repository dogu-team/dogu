import { PageDtoBase } from '@dogu-private/console';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export const DEFAULT_PAGE_NO = 1;
export const DEFAULT_PAGE_SIZE = 10;

export class PageDto implements PageDtoBase {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number = DEFAULT_PAGE_NO;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset: number = DEFAULT_PAGE_SIZE;

  constructor(page?: number, offset?: number) {
    this.page = page ? Math.abs(page) : DEFAULT_PAGE_NO;
    this.offset = offset ? Math.abs(offset) : DEFAULT_PAGE_SIZE;
  }

  public getDBOffset(): number {
    if (this.page === null || this.page === undefined || this.page < 1) {
      this.page = DEFAULT_PAGE_NO;
    }

    if (this.offset === null || this.offset === undefined || this.offset < 1) {
      this.offset = DEFAULT_PAGE_SIZE;
    }
    const offset = (Number(this.page) - 1) * Number(this.offset);
    return offset;
  }

  public getDBLimit(): number {
    if (this.offset === null || this.offset === undefined || this.offset < 1) {
      this.offset = DEFAULT_PAGE_SIZE;
    }
    const limit = Number(this.offset);
    return limit;
  }

  public getDBRankStart(): number {
    const rankStart = this.getDBOffset();
    return rankStart;
  }

  public getDBRankEnd(): number {
    const rankEnd = this.getDBOffset() + this.getDBLimit() + 1;
    return rankEnd;
  }
}
