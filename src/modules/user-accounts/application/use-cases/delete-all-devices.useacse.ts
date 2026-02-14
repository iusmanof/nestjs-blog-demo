import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infra/session.repository';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class DeleteAllDevicesCommand {
  constructor(public readonly refreshToken: string) {}
}
@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase implements ICommandHandler<DeleteAllDevicesCommand> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: DeleteAllDevicesCommand): Promise<void> {
    let payload: { userId: string; deviceId: string };

    try {
      payload = this.jwtService.verify(command.refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    // удалить ВСЕ устройства пользователя кроме текущего
    await this.sessionRepository.deleteAllExceptCurrent(
      payload.userId,
      payload.deviceId,
    );
  }
}
