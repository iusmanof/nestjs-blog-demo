import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionRepository } from '../../infra/session.repository';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenPayload } from '../../../../core/types/refresh-token-payload.type';

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
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const deviceId = randomUUID();

    // вынести используя useFactory
    const accessToken = this.jwtService.sign(
      { id: command.userId },
      {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        expiresIn: '10s',
      },
    );

    // вынести используя useFactory
    const refreshToken = this.jwtService.sign(
      { userId: command.userId, deviceId },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: '20s',
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const decoded: RefreshTokenPayload = this.jwtService.decode(refreshToken);

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
