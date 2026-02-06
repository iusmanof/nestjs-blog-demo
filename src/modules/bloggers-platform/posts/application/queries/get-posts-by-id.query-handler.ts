import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import PostsQueryRepository from '../../infra/posts.query-repository';
import { PostViewDto } from '../../api/view-dto/post-view.dto';
import { NotFoundException } from '@nestjs/common';

export class GetPostByIdQuery {
  constructor(
    public postId: string,
    public currentUserId?: string,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private readonly postQueryRepository: PostsQueryRepository) {}

  async execute(query: GetPostByIdQuery): Promise<PostViewDto> {
    const post = await this.postQueryRepository.findByIdWithRequestingUser(
      query.postId,
      query.currentUserId,
    );

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostViewDto.mapToView(post);
  }
}
