import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentsQueryParamsDto } from '../api/input-dto/comments-query-params.dto';
import { SortDirection } from '../../../../core/dto/base.query-params.dto';
import { Comment, CommentDocument } from '../domain/comment.entity';

@Injectable()
class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async getByPostId(postId: Types.ObjectId, query: CommentsQueryParamsDto) {
    const filter = { postId };

    const totalCount = await this.commentModel.countDocuments(filter);

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const items = await this.commentModel
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    };
  }
}

export default CommentsQueryRepository;
