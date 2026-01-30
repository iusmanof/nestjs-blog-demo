import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../api/input-dto/create-post.dto';
import { PostDocument } from '../domain/posts.entity';
import PostsRepository from '../infra/posts.repository';
import { CreatePostForBlogDto } from '../api/input-dto/create-post-for-blog.dto';
import BlogsQueryRepository from '../../blogs/infra/blogs.query-repository';
import { PostViewDto } from '../api/view-dto/post-view.dto';
import { Types } from 'mongoose';

@Injectable()
class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async create(dto: CreatePostDto): Promise<PostDocument> {
    return await this.postsRepository.create(dto);
  }

  async update(id: string, dto: CreatePostDto): Promise<boolean> {
    return await this.postsRepository.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    return await this.postsRepository.delete(id);
  }

  async createForBlog(blogId: Types.ObjectId, dto: CreatePostForBlogDto) {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    const blogName = blog.name;
    const post = await this.postsRepository.createForBlog(
      dto,
      blogId,
      blogName,
    );
    return PostViewDto.mapToView(post);
  }
}

export default PostsService;
