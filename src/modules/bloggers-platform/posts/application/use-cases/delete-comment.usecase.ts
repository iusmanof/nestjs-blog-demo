import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/filters/domain-exception-codes';

export class DeleteCommentCommand {
  constructor(public commentId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor() {}
  execute(command: DeleteCommentCommand): Promise<void> {
    throw new DomainException({
      code: DomainExceptionCode.BadRequest,
      message: `Method not implemented.UpdateCommentCommand dto: ${command.commentId}`,
      extensions: [
        new Extension(
          'Comment with given id does not exist',
          `${command.commentId}`,
        ),
      ],
    });
  }
}
