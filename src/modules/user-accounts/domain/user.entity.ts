import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ type: String, required: true, unique: true })
  login: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  createdAt: Date;

  _id: string;

  get id() {
    return this._id.toString();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
