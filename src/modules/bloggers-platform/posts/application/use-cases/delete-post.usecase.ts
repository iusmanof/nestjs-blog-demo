import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import PostsRepository from '../../infra/posts.repository';
import { NotFoundException } from '@nestjs/common';

export class DeletePostCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const deleted = await this.postsRepository.delete(command.id);
    if (!deleted) {
      throw new NotFoundException('Post not found');
    }
  }
}
