import { SessionDocument } from '../../domain/session.entity';

export class DeviceViewDto {
  deviceId: string;
  title: string;
  ip: string;
  lastActiveDate: Date;

  static mapToView(session: SessionDocument): DeviceViewDto {
    return {
      deviceId: session.deviceId,
      title: session.title,
      ip: session.ip,
      lastActiveDate: session.lastActiveDate,
    };
  }

  static mapToViews(sessions: SessionDocument[]): DeviceViewDto[] {
    return sessions.map((s) => this.mapToView(s));
  }
}
