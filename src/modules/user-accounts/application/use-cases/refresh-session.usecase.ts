import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { UsersQueryRepository } from '../../infra/users.query-repository';
import { SessionRepository } from '../../infra/session.repository';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshSession } from '../../../../core/types/refresh-session.type';
import bcrypt from 'bcrypt';

export class RefreshSessionCommand {
  constructor(public readonly refreshToken: string) {}
}
@CommandHandler(RefreshSessionCommand)
export class RefreshSessionUseCase implements ICommandHandler<RefreshSessionCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: RefreshSessionCommand): Promise<RefreshSession> {
    const { refreshToken } = command;

    let payload: { deviceId: string; userId: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
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

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const user = await this.usersQueryRepository.findById(session.userId);
    if (!user) throw new UnauthorizedException('User not found');

    // Генерация нового refresh токена
    const newRefreshToken = this.jwtService.sign(
      { userId: user.id, deviceId: session.deviceId },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '15s',
      },
    );
    const newHash = await bcrypt.hash(newRefreshToken, 10);
    const decodedNew: any = this.jwtService.decode(newRefreshToken);
    const lastActiveDate = new Date(decodedNew.iat * 1000);
    const expiresAt = new Date(decodedNew.exp * 1000);

    // **атомарное обновление старого токена на новый**
    const updated = await this.sessionRepository.useRefreshToken(
      session.deviceId,
      session.refreshTokenHash,
      newHash,
      lastActiveDate,
      expiresAt,
    );

    if (!updated) {
      throw new UnauthorizedException('Refresh token has already been used');
    }

    // Генерация access токена
    const accessToken = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '10s',
      },
    );

    return { accessToken, newRefreshToken };
  }
}
