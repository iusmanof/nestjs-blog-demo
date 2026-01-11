import { PostViewDto } from './post-view.dto';

export class PostPaginatedViewDto {
  items: PostViewDto[];
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;

  static mapToView(data: {
    items: PostViewDto[];
    page: number;
    pageSize: number;
    totalCount: number;
  }): PostPaginatedViewDto {
    return {
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: data.page,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
