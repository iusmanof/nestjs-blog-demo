import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type LikeStatus = 'None' | 'Like' | 'Dislike';

export class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikes[];
}

export class NewestLikes {
  addedAt: Date;
  userId: string;
  login: string;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({
    _id: false,
    default: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    },
    type: {
      likesCount: { type: Number },
      dislikesCount: { type: Number },
      myStatus: { type: String },
      newestLikes: [
        {
          _id: false,
          addedAt: { type: Date },
          userId: { type: String },
          login: { type: String },
        },
      ],
    },
  })
  extendedLikesInfo: ExtendedLikesInfo;

  @Prop()
  createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
