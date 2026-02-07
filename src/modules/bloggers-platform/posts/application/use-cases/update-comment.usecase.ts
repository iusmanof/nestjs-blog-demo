import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/filters/domain-exception-codes';
import { UpdateCommentDto } from '../../api/input-dto/update-comment.dto';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public dto: UpdateCommentDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor() {}
  execute(command: UpdateCommentCommand): Promise<void> {
    throw new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Comment not found',
      extensions: [
        new Extension(
          'Comment with given id does not exist',
          `${command.commentId}`,
        ),
      ],
    });
  }
}
