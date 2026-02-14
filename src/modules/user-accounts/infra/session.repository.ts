import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../domain/session.entity';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async findByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    return this.sessionModel.findOne({ deviceId }).exec();
  }

  async findByUserId(userId: string): Promise<SessionDocument[]> {
    return this.sessionModel
      .find({ userId })
      .sort({ lastActiveDate: -1 })
      .exec();
  }

  async createSession(dto: {
    userId: string;
    deviceId: string;
    ip: string;
    title: string;
    refreshTokenHash: string;
    lastActiveDate: Date;
    expiresAt: Date;
  }): Promise<SessionDocument> {
    const session = new this.sessionModel({ ...dto });
    return session.save();
  }

  async useRefreshToken(
    deviceId: string,
    oldHash: string,
    newHash: string,
    lastActiveDate: Date,
    expiresAt: Date,
  ): Promise<boolean> {
    const result = await this.sessionModel.updateOne(
      { deviceId, refreshTokenHash: oldHash }, // фильтруем по старому hash
      { $set: { refreshTokenHash: newHash, lastActiveDate, expiresAt } },
    );

    return result.modifiedCount === 1;
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    await this.sessionModel.deleteOne({ deviceId }).exec();
  }

  async deleteAll(): Promise<void> {
    await this.sessionModel.deleteMany({}).exec();
  }

  async deleteAllExceptCurrent(userId: string, deviceId: string) {
    await this.sessionModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
  }
}
