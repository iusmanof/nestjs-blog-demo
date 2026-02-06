import { UpdateLikeStatusDto } from '../../api/input-dto/update-like-status.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import PostsRepository from '../../infra/posts.repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import PostsQueryRepository from '../../infra/posts.query-repository';

export class UpdateLikeStatusCommand {
  constructor(
    public userId: string,
    public postId: string,
    public login: string,
    public dto: UpdateLikeStatusDto,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler<UpdateLikeStatusCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  async execute(command: UpdateLikeStatusCommand): Promise<any> {
    if (!command.userId) {
      throw new UnauthorizedException('User not found');
    }

    const post = await this.postsQueryRepository.findById(command.postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return await this.postsRepository.setLikeStatus(
      command.userId,
      command.postId,
      command.login,
      command.dto.likeStatus,
    );
  }
}
