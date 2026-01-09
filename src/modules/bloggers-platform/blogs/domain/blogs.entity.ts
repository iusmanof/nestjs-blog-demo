import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Blog {
  @Prop({ type: String, required: true, maxlength: 15 })
  name: string;

  @Prop({ type: String, required: true, maxlength: 500 })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  createdAt: Date;
}

// создаёт mongoose-схему на основе класса
export const BlogSchema = SchemaFactory.createForClass(Blog);

// регистрирует методы (если они есть) в схеме mongoose
BlogSchema.loadClass(Blog);

// Типизация документа (экземпляр из БД)
export type BlogDocument = HydratedDocument<Blog>;

// Типизация модели (Model + статические методы класса)
export type BlogModelType = Model<BlogDocument> & typeof Blog;
