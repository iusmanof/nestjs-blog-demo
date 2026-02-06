import { LikeStatus } from '../../../../../core/types/like-status.type';
import { PostDocument } from '../../domain/posts.entity';

export type ExtendedLikesInfoViewDto = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikeViewDto[];
};

export type NewestLikeViewDto = {
  userId: string;
  login: string;
  addedAt: Date;
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapToView = (post: PostDocument): PostViewDto => ({
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId.toString(),
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus: post.extendedLikesInfo.myStatus,
      newestLikes: post.extendedLikesInfo.newestLikes
        .filter((like) => like.status === 'Like')
        .slice(0, 3)
        .map(
          (like): NewestLikeViewDto => ({
            userId: like.userId,
            login: like.login,
            addedAt: like.addedAt,
          }),
        ),
    },
  });
}
