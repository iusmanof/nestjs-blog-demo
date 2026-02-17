import { JwtService } from '@nestjs/jwt';

export class GetDevicesQuery {
  constructor(public readonly refreshToken: string) {}
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infra/session.repository';
import { ConfigService } from '@nestjs/config';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { DeviceViewDto } from '../../api/view-dto/device-view.dto';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../constants/auth-tokens.inject-constants';
import { UserAccountsConfig } from '../../config/user-accounts.config';

@QueryHandler(GetDevicesQuery)
export class GetDevicesQueryHandler implements IQueryHandler<GetDevicesQuery> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwtService: JwtService,
    private readonly config: UserAccountsConfig,
  ) {}

  async execute(query: GetDevicesQuery) {
    let payload: {
      userId: string;
      deviceId: string;
    };

    try {
      payload = this.jwtService.verify(query.refreshToken, {
        secret: this.config.refreshTokenSecret,
      });
    } catch (e) {
      throw new UnauthorizedException(e);
    }
    const sessions = await this.sessionRepository.findByUserId(payload.userId);
    return DeviceViewDto.mapToViews(sessions);
  }
}
