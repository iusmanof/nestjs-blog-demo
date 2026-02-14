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

    let payload: { userId: string; deviceId: string; iat: number };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    console.log('Logout refresh token:', refreshToken);
    const session = await this.sessionRepository.findByDeviceId(
      payload.deviceId,
    );
    console.log('Session to delete:', session);
    if (!session || session.userId !== payload.userId) {
      throw new UnauthorizedException('Session not found');
    }

    // Удаляем сессию — токен становится недействительным
    await this.sessionRepository.deleteByDeviceId(payload.deviceId);
    console.log('Session deleted');
  }
}
