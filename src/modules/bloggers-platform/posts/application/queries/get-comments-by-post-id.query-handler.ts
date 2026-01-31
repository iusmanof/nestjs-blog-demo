import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import PostsQueryRepository from '../../infra/posts.query-repository';
import { Types } from 'mongoose';
import CommentsQueryRepository from '../../infra/comments.query-repository';
import { CommentsQueryParamsDto } from '../../api/input-dto/comments-query-params.dto';
import { CommentViewDto } from '../../api/view-dto/comment-view.dto';
import { NotFoundException } from '@nestjs/common';

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
    const objectId = new Types.ObjectId(postId);

    const post = await this.postsQueryRepository.findById(objectId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { items, totalCount } =
      await this.commentsQueryRepository.getByPostId(objectId, queryParams);

    return {
      pagesCount: Math.ceil(totalCount / queryParams.pageSize),
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      totalCount,
      items: items.map(CommentViewDto.mapToView),
    };
  }
}
