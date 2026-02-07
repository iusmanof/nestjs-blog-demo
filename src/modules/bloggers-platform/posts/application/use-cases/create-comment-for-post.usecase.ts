import { CreateCommentDto } from '../../api/input-dto/create-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Promise } from 'mongoose';
import { CommentViewDto } from '../../api/view-dto/comment-view.dto';
import CommentsRepository from '../../infra/comment.repository';
import PostsQueryRepository from '../../infra/posts.query-repository';
import { DomainException } from '../../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/filters/domain-exception-codes';

export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public login: string,
    public dto: CreateCommentDto,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommandHandler<CreateCommentForPostCommand> {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: CreateCommentForPostCommand): Promise<CommentViewDto> {
    const post = await this.postsQueryRepository.findById(command.postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const entity = await this.commentsRepository.create(
      command.postId,
      command.userId,
      command.login,
      command.dto.content,
    );

    await this.commentsRepository.save(entity);
    return CommentViewDto.mapToView(entity);
  }
}
