import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreatePostForBlogDto } from '../../blogs/dto/create-post-for-blog.dto';
import BlogsQueryRepository from '../../blogs/infra/blogs.query-repository';

@Injectable()
class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async create(dto: CreatePostDto): Promise<PostDocument> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(
      dto.blogId,
    );

    const post = new this.postModel({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    await post.save();
    return post;
  }
  async update(id: string, dto: CreatePostDto): Promise<boolean> {
    const post = await this.postModel.updateOne(
      { _id: id },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
        },
      },
    );
    return post.matchedCount === 1;
  }
  async delete(id: string): Promise<boolean> {
    const post = await this.postModel.deleteOne({ _id: id });
    return post.deletedCount === 1;
  }

  async createForBlog(
    dto: CreatePostForBlogDto,
    blogId: string,
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

  async deleteAll() {
    await this.postModel.deleteMany({});
  }
}

export default PostsRepository;
