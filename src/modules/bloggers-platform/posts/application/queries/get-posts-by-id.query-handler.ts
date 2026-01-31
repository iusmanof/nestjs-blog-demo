import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import PostsQueryRepository from '../../infra/posts.query-repository';
import { PostViewDto } from '../../api/view-dto/post-view.dto';

export class GetPostByIdQuery {
  constructor(public id: Types.ObjectId) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private readonly postQueryRepository: PostsQueryRepository) {}

  execute(query: GetPostByIdQuery): Promise<PostViewDto> {
    return this.postQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
