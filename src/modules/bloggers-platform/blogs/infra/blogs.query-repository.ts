import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blogs.entity';
import { Model } from 'mongoose';
import { BlogViewDto } from '../api/view-dto/blog-view.dto';
import { BlogPaginatedViewDto } from '../api/view-dto/blog-paginated.view.dto';
import { SortDirection } from '../../../../core/dto/base.query-params.dto';
import { BlogsQueryParamsDto } from '../api/input-dto/blogs-query-params.dto';

@Injectable()
class BlogQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<BlogDocument>,
  ) {}

  async getAll(query: BlogsQueryParamsDto) {
    const filter: any = {};

    if (query.searchNameTerm) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      filter.name = { $regex: query.searchNameTerm, $options: 'i' } as any;
    }

    const totalCount = await this.blogModel.countDocuments(filter);

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const items = blogs.map(BlogViewDto.mapToView);

    return BlogPaginatedViewDto.mapToView<BlogViewDto>({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrNotFoundFail(id: string) {
    const blog = await this.blogModel.findById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return BlogViewDto.mapToView(blog);
  }
}

export default BlogQueryRepository;
