import { BlogsQueryParamsDto } from '../../api/input-dto/blogs-query-params.dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogPaginatedViewDto } from '../../api/view-dto/blog-paginated.view.dto';
import { BlogViewDto } from '../../api/view-dto/blog-view.dto';
import BlogsQueryRepository from '../../infra/blogs.query-repository';
import { Inject } from '@nestjs/common';

export class GetBlogsQuery {
  constructor(public queryParams: BlogsQueryParamsDto) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<
  GetBlogsQuery,
  BlogPaginatedViewDto<BlogViewDto>
> {
  constructor(
    @Inject(BlogsQueryRepository)
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async execute(
    query: GetBlogsQuery,
  ): Promise<BlogPaginatedViewDto<BlogViewDto>> {
    return this.blogsQueryRepository.getAll(query.queryParams);
  }
}
