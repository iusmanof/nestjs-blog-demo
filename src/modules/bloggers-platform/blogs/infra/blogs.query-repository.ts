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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      filter.name = { $regex: query.searchNameTerm, $options: 'i' } as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const totalCount = await this.blogModel.countDocuments(filter);

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const blogs = await this.blogModel
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const entity = await this.blogModel.findById(id);
    if (!entity) {
      throw new Error('Blog not found');
    }
    return BlogViewDto.mapToView(entity);
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const entity = await this.blogModel.findById(id);
    if (!entity) {
      throw new NotFoundException('Blog not found');
    }
    return entity;
  }
}

export default BlogQueryRepository;
