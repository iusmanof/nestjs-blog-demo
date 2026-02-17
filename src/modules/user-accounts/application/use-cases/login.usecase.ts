import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SessionRepository } from '../../infra/session.repository';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenPayload } from '../../../../core/types/refresh-token-payload.type';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';

export class LoginCommand {
  constructor(
    public readonly userId: string,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessJwt: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshJwt: JwtService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const deviceId = randomUUID();

    const accessToken = this.accessJwt.sign({ id: command.userId });
    const refreshToken = this.refreshJwt.sign({
      userId: command.userId,
      deviceId,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const decoded: RefreshTokenPayload = this.refreshJwt.decode(refreshToken);

    const lastActiveDate = new Date(decoded.iat * 1000);

    const expiresAt = new Date(decoded.exp * 1000);

    await this.sessionRepository.createSession({
      userId: command.userId,
      deviceId: deviceId,
      ip: command.ip,
      title: command.userAgent,
      refreshTokenHash: refreshTokenHash,
      lastActiveDate: lastActiveDate,
      expiresAt: expiresAt,
    });

    return Promise.resolve({
      accessToken,
      refreshToken,
    });
  }
}
