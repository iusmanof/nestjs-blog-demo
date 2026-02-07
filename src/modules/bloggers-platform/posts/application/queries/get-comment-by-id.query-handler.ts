import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/filters/domain-exception-codes';

export class GetCommentByIdQuery {
  constructor(public commentId: string) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor() {}

  execute(query: GetCommentByIdQuery): Promise<any> {
    throw new DomainException({
      code: DomainExceptionCode.NotFound,
      message: `Comment not found ${query.commentId}`,
      extensions: [
        new Extension(
          'Comment with given id does not exist',
          `${query.commentId}`,
        ),
      ],
    });
  }
}
