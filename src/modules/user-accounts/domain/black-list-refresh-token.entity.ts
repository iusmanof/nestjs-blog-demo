import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlacklistedRefreshTokenDocument = BlacklistedRefreshToken &
  Document;

@Schema({ timestamps: true })
export class BlacklistedRefreshToken {
  @Prop({ required: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const BlacklistedRefreshTokenSchema = SchemaFactory.createForClass(
  BlacklistedRefreshToken,
);
