import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import PostsQueryRepository from '../../../posts/infra/posts.query-repository';
import { PostsQueryParamsDto } from '../../../posts/api/input-dto/posts-query-params.dto';
import { PostViewDto } from '../../../posts/api/view-dto/post-view.dto';
import { PostPaginatedViewDto } from '../../../posts/api/view-dto/post-paginated.view.dto';

export class GetPostsForBlogQuery {
  constructor(
    public blogId: string,
    public queryParams: PostsQueryParamsDto,
  ) {}
}

@QueryHandler(GetPostsForBlogQuery)
export class GetPostsForBlogQueryHandler implements IQueryHandler<
  GetPostsForBlogQuery,
  PostPaginatedViewDto<PostViewDto>
> {
  constructor(
    @Inject(PostsQueryRepository)
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({
    blogId,
    queryParams,
  }: GetPostsForBlogQuery): Promise<PostPaginatedViewDto<PostViewDto>> {
    const { items, totalCount } =
      await this.postsQueryRepository.getPostsForBlog(blogId, queryParams);

    return {
      pagesCount: Math.ceil(totalCount / queryParams.pageSize),
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      totalCount,
      items: items.map(PostViewDto.mapToView),
    };
  }
}
