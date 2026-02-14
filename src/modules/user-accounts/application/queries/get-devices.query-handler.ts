import { JwtService } from '@nestjs/jwt';

export class GetDevicesQuery {
  constructor(public readonly refreshToken: string) {}
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infra/session.repository';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { DeviceViewDto } from '../../api/view-dto/device-view.dto';

@QueryHandler(GetDevicesQuery)
export class GetDevicesQueryHandler implements IQueryHandler<GetDevicesQuery> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(query: GetDevicesQuery) {
    let payload: {
      userId: string;
      deviceId: string;
    };

    try {
      payload = this.jwtService.verify(query.refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (e) {
      throw new UnauthorizedException(e);
    }
    const sessions = await this.sessionRepository.findByUserId(payload.userId);
    return DeviceViewDto.mapToViews(sessions);
  }
}
