import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import PostsQueryRepository from '../../infra/posts.query-repository';
import CommentsQueryRepository from '../../infra/comments.query-repository';
import { CommentsQueryParamsDto } from '../../api/input-dto/comments-query-params.dto';
import { CommentViewDto } from '../../api/view-dto/comment-view.dto';
import { DomainException } from '../../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/filters/domain-exception-codes';

export class GetCommentsByPostIdQuery {
  constructor(
    public postId: string,
    public queryParams: CommentsQueryParamsDto,
  ) {}
}

@QueryHandler(GetCommentsByPostIdQuery)
export class GetCommentsByPostIdQueryHandler implements IQueryHandler<GetCommentsByPostIdQuery> {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({ postId, queryParams }: GetCommentsByPostIdQuery) {
    const post = await this.postsQueryRepository.findById(postId);
    if (!post) {
      // throw new NotFoundException('Post not found');
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const { items, totalCount } =
      await this.commentsQueryRepository.getByPostId(postId, queryParams);

    return {
      pagesCount: Math.ceil(totalCount / queryParams.pageSize),
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      totalCount,
      items: items.map(CommentViewDto.mapToView),
    };
  }
}
