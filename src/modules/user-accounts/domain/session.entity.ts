import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';

@Schema({ timestamps: false })
export class Session {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop({ required: true })
  title: string; // user-agent

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  refreshTokenHash: string;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  static create(
    userId: string,
    ip: string,
    title: string,
    refreshTokenHash: string,
    lastActiveDate: Date,
    expiresAt: Date,
  ): Session {
    const session = new Session();
    session.userId = userId;
    session.deviceId = randomUUID();
    session.ip = ip;
    session.title = title;
    session.refreshTokenHash = refreshTokenHash;
    session.lastActiveDate = lastActiveDate;
    session.expiresAt = expiresAt;
    return session;
  }
}

export type SessionDocument = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);
