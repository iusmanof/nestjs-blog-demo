import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import BlogsRepository from '../../infra/blogs.repository';
import { NotFoundException } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<
  DeleteBlogCommand,
  void
> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    const isDeleted = await this.blogsRepository.delete(id);
    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
}
