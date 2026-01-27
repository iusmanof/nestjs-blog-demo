import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserContextDto } from '../dto/user-context.dto';

export const ExtractUserFromRequest = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserContextDto => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserContextDto }>();

    if (!request.user) {
      throw new UnauthorizedException();
    }

    return request.user;
  },
);
