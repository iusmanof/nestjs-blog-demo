import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryParamsDto } from '../../api/input-dto/posts-query-params.dto';
import PostsQueryRepository from '../../infra/posts.query-repository';
import { PostPaginatedViewDto } from '../../api/view-dto/post-paginated.view.dto';
import { PostViewDto } from '../../api/view-dto/post-view.dto';

export class GetPostQuery {
  constructor(public queryParams: PostsQueryParamsDto) {}
}

@QueryHandler(GetPostQuery)
export class GetPostQueryHandler implements IQueryHandler<GetPostQuery> {
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}

  async execute(
    query: GetPostQuery,
  ): Promise<PostPaginatedViewDto<PostViewDto>> {
    const { items, totalCount } = await this.postsQueryRepository.getAll(
      query.queryParams,
    );

    return PostPaginatedViewDto.mapToView({
      items: items.map(PostViewDto.mapToView),
      page: query.queryParams.pageNumber,
      pageSize: query.queryParams.pageSize,
      totalCount,
    });
  }
}
