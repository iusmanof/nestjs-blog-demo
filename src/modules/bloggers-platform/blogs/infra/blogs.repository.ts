import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from '../api/input-dto/create-blog.dto';
import { Types } from 'mongoose';
import type { BlogModelType } from '../domain/blogs.entity';
import { UpdateBlogDto } from '../api/input-dto/update-blog.dto';

@Injectable()
class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
  ) {}

  create(dto: CreateBlogDto): BlogDocument {
    return this.blogModel.createInstance(dto);
  }

  async update(id: Types.ObjectId, dto: UpdateBlogDto): Promise<boolean> {
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

  async delete(id: string): Promise<boolean> {
    const blog = await this.blogModel.deleteOne({ _id: id });
    return blog.deletedCount === 1;
  }

  async deleteAll() {
    await this.blogModel.deleteMany({});
  }

  async save(entity: BlogDocument): Promise<void> {
    await entity.save();
  }
}

export default BlogsRepository;
