import type { LikeStatus } from '../../../../../core/types/like-status.type';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class UpdateCommentLikeStatusDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsIn(['Like', 'Dislike', 'None'])
  likeStatus: LikeStatus;
}
