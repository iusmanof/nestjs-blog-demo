import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsQueryParams } from '../api/posts.query-params';
import { PostViewDto } from '../api/post-view.dto';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostPaginatedViewDto } from '../../blogs/dto/post-paginated.view.dto';
import BlogQueryRepository from '../../blogs/infra/blogs.query-repository';
import { SortDirection } from '../../../../core/dto/base.query-params.dto';

@Injectable()
class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly blogsQueryRepository: BlogQueryRepository,
  ) {}
  async getAll(query: PostsQueryParams) {
    const totalCount = await this.postModel.countDocuments();

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const items = await this.postModel
      .find()
      .sort({ [sortField]: sortOrder })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    return PostPaginatedViewDto.mapToView({
      items: items.map(PostViewDto.mapToView),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: string) {
    const post = await this.postModel.findById(id).lean();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostViewDto.mapToView(post);
  }

  async getPostsForBlog(blogId: string, query: PostsQueryParams) {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    const filter = { blogId };

    const totalCount = await this.postModel.countDocuments(filter);

    const items = await this.postModel
      .find(filter)
      .sort({
        [query.sortBy]: query.sortDirection === SortDirection.Asc ? 1 : -1,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    return PostPaginatedViewDto.mapToView({
      items: items.map(PostViewDto.mapToView),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
    });
  }
}

export default PostsQueryRepository;
