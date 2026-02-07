import { UpdateCommentLikeStatusDto } from '../../api/input-dto/update-comment-like-status.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/filters/domain-exception-codes';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public dto: UpdateCommentLikeStatusDto,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase implements ICommandHandler<UpdateCommentLikeStatusCommand> {
  constructor() {}
  execute(command: UpdateCommentLikeStatusCommand): Promise<void> {
    throw new DomainException({
      code: DomainExceptionCode.BadRequest,
      message: `Method not implemented.UpdateCommentLikeStatusCommand dto: ${command.commentId}`,
    });
  }
}
