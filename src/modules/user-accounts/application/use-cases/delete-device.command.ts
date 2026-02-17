import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { SessionRepository } from '../../infra/session.repository';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../constants/auth-tokens.inject-constants';
import { UserAccountsConfig } from '../../config/user-accounts.config';

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
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwtService: JwtService,
    private readonly config: UserAccountsConfig,
  ) {}

  async execute(command: DeleteDeviceCommand): Promise<void> {
    let payload: { userId: string };

    try {
      payload = this.jwtService.verify(command.refreshToken, {
        secret: this.config.refreshTokenSecret,
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
