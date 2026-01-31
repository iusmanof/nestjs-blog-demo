import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import BlogsRepository from '../../infra/blogs.repository';
import BlogQueryRepository from '../../infra/blogs.query-repository';

export class DeleteBlogCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<
  DeleteBlogCommand,
  void
> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    await this.blogQueryRepository.findOrNotFoundFail(id);
    await this.blogsRepository.delete(id);
  }
}
