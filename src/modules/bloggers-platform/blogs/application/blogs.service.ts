import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../api/input-dto/create-blog.dto';
import BlogsRepository from '../infra/blogs.repository';
import { BlogViewDto } from '../api/view-dto/blog-view.dto';
import { Types } from 'mongoose';

@Injectable()
class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async create(dto: CreateBlogDto): Promise<BlogViewDto> {
    const blog = await this.blogsRepository.create(dto);
    return BlogViewDto.mapToView(blog);
  }

  async update(id: Types.ObjectId, dto: CreateBlogDto): Promise<boolean> {
    return await this.blogsRepository.update(id, dto);
  }

  async delete(id: Types.ObjectId): Promise<boolean> {
    return await this.blogsRepository.delete(id);
  }
}

export default BlogsService;
