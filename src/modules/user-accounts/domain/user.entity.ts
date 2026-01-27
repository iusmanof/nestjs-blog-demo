import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ type: String, required: true, unique: true })
  login: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  passwordHash: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;
  createdAt: Date;
  _id: string;

  @Prop({
    type: {
      code: { type: String, required: false },
      expiresAt: { type: Date, required: false },
      isConfirmed: { type: Boolean, default: false },
    },
  })
  emailConfirmation: {
    code?: string;
    expiresAt?: Date;
    isConfirmed: boolean;
  };

  @Prop({ type: String })
  recoveryCode?: string;

  @Prop({ type: Date })
  recoveryCodeExpiration?: Date;

  get id() {
    return this._id.toString();
  }

  setConfirmationCode(code: string) {
    this.emailConfirmation = {
      code,
      isConfirmed: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    };
  }

  confirmEmail() {
    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.code = undefined;
    this.emailConfirmation.expiresAt = undefined;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
