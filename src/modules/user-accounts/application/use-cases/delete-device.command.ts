import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionRepository } from '../../infra/session.repository';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export class DeleteDeviceCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase implements ICommandHandler<DeleteDeviceCommand> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: DeleteDeviceCommand): Promise<void> {
    let payload: { userId: string };

    try {
      payload = this.jwtService.verify(command.refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    const session = await this.sessionRepository.findByDeviceId(
      command.deviceId,
    );

    if (!session) {
      throw new NotFoundException();
    }

    if (session.userId !== payload.userId) {
      throw new ForbiddenException();
    }

    await this.sessionRepository.deleteByDeviceId(command.deviceId);
  }
}
