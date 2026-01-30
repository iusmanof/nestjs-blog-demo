import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from '../api/input-dto/create-blog.dto';
import { Model, Types } from 'mongoose';

@Injectable()
class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async create(dto: CreateBlogDto): Promise<BlogDocument> {
    const blog = new this.blogModel({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
    });

    await blog.save();
    return blog;
  }

  async update(id: Types.ObjectId, dto: CreateBlogDto): Promise<boolean> {
    const blog = await this.blogModel.updateOne(
      { _id: id },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );
    return blog.matchedCount === 1;
  }

  async delete(id: Types.ObjectId): Promise<boolean> {
    const blog = await this.blogModel.deleteOne({ _id: id });
    return blog.deletedCount === 1;
  }

  async deleteAll() {
    await this.blogModel.deleteMany({});
  }

  async save(entity: BlogDocument) {
    await entity.save();
  }
}

export default BlogsRepository;
