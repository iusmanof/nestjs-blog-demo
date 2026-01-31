import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Post } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from '../api/input-dto/create-post.dto';
import { CreatePostForBlogDto } from '../api/input-dto/create-post-for-blog.dto';
import BlogsQueryRepository from '../../blogs/infra/blogs.query-repository';
import type { PostDocument, PostModelType } from '../domain/posts.entity';

@Injectable()
class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: PostModelType,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async create(dto: CreatePostDto): Promise<PostDocument> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(
      dto.blogId,
    );

    return this.postModel.createInstance(dto, blog.name);
  }

  async update(
    id: Types.ObjectId,
    dto: CreatePostDto,
    blogName: string,
  ): Promise<boolean> {
    const post = await this.postModel.findById(id);
    if (!post) return false;

    post.update(dto, blogName);
    await post.save();

    return true;
  }
  async delete(id: Types.ObjectId): Promise<boolean> {
    const result = await this.postModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async createForBlog(
    dto: CreatePostForBlogDto,
    blogId: Types.ObjectId,
    blogName: string,
  ): Promise<PostDocument> {
    const post = new this.postModel({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blogName,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    await post.save();
    return post;
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async deleteAll() {
    await this.postModel.deleteMany({});
  }
}

export default PostsRepository;
