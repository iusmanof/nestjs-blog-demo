import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UpdatePostDto } from '../../api/input-dto/update-post.dto';
import PostsRepository from '../../infra/posts.repository';

export class UpdatePostCommand {
  constructor(
    public id: Types.ObjectId,
    public dto: UpdatePostDto,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUserCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}
  execute(command: UpdatePostCommand): Promise<any> {
    return this.postsRepository.update(command.id, command.dto);
  }
}
