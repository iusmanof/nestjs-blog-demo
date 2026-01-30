import { Types } from 'mongoose';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewDto } from '../../api/view-dto/blog-view.dto';
import BlogQueryRepository from '../../infra/blogs.query-repository';

export class GetBlogByIdQuery {
  constructor(
    public id: Types.ObjectId,
    public userId: Types.ObjectId | null,
  ) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(private readonly blogQueryRepository: BlogQueryRepository) {}
  execute(query: GetBlogByIdQuery): Promise<BlogViewDto> {
    return this.blogQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
