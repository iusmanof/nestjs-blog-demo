import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Blog {
  @Prop({ type: String, maxLength: 15, required: true })
  name: string;

  @Prop({ type: String, maxLength: 500, required: true })
  description: string;

  @Prop({
    type: String,
    maxLength: 100,
    required: true,
    match: [
      /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
      'Website URL must be a valid HTTPS URL',
    ],
  })
  websiteUrl: string;

  createdAt: string;

  // get id() {
  //   return this._id.toString();
  // }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;
