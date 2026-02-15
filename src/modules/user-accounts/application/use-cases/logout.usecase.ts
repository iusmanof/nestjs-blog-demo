import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionRepository } from '../../infra/session.repository';
import { UnauthorizedException } from '@nestjs/common';

export class LogoutCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { refreshToken } = command;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookie');
    }

    let payload: { userId: string; deviceId: string; iat: number };
    try {
      payload = this.jwtService.verify<{
        userId: string;
        deviceId: string;
        iat: number;
      }>(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const session = await this.sessionRepository.findByDeviceId(
      payload.deviceId,
    );
    if (!session || session.userId !== payload.userId) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.isRevoked) {
      throw new UnauthorizedException('Token already revoked');
    }
    session.isRevoked = true;
    await session.save();

    await this.sessionRepository.deleteByDeviceId(payload.deviceId);
  }
}
