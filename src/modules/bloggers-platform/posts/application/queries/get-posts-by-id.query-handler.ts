import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import PostsQueryRepository from '../../infra/posts.query-repository';
import { PostViewDto } from '../../api/view-dto/post-view.dto';
import { NotFoundException } from '@nestjs/common';

export class GetPostByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private readonly postQueryRepository: PostsQueryRepository) {}

  async execute(query: GetPostByIdQuery): Promise<PostViewDto> {
    const post = await this.postQueryRepository.findById(query.id);

    if (!post) {
      throw new NotFoundException('Post not found'); // тут уже решаем HTTP
    }

    return PostViewDto.mapToView(post);
  }
}
