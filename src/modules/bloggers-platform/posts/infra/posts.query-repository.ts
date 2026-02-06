import { Injectable } from '@nestjs/common';
import { PostsQueryParamsDto } from '../api/input-dto/posts-query-params.dto';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import BlogQueryRepository from '../../blogs/infra/blogs.query-repository';
import { SortDirection } from '../../../../core/dto/base.query-params.dto';

@Injectable()
class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly blogsQueryRepository: BlogQueryRepository,
  ) {}
  async getAll(query: PostsQueryParamsDto) {
    const totalCount = await this.postModel.countDocuments();

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const items = await this.postModel
      .find()
      .sort({ [sortField]: sortOrder })
      .skip(query.calculateSkip())
      .limit(query.pageSize);
    // .lean();

    return {
      totalCount,
      items,
    };
  }

  async findById(id: string): Promise<PostDocument | null> {
    return await this.postModel.findById(id).exec();
  }

  async findByIdWithRequestingUser(
    postId: string,
    currentUserId?: string,
  ): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) return null;
    post.computeExtendedLikesInfo(currentUserId);
    return post;
  }

  async getPostsForBlog(blogId: string, query: PostsQueryParamsDto) {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    const filter = { blogId };

    const totalCount = await this.postModel.countDocuments(filter);

    const items = await this.postModel
      .find(filter)
      .sort({
        [query.sortBy]: query.sortDirection === SortDirection.Asc ? 1 : -1,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);
    // .lean();

    return {
      totalCount,
      items,
    };
  }
}

export default PostsQueryRepository;
