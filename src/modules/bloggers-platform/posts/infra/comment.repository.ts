import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import type { CommentModelType } from '../domain/comment.entity';

@Injectable()
class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
  ) {}

  async create(
    postId: string,
    userId: string,
    login: string,
    content: string,
  ): Promise<CommentDocument> {
    return await this.commentModel.createInstance(
      postId,
      userId,
      login,
      content,
    );
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}

export default CommentsRepository;
