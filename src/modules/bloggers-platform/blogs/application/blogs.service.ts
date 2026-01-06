import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsService {
  findAll() {
    return {
      pagesCount: 0,
      page: 0,
      pageSize: 0,
      totalCount: 0,
      items: [
        {
          id: 'string',
          name: 'string',
          description: 'string',
          websiteUrl: 'string',
          createdAt: '2026-01-02T22:19:11.334Z',
          isMembership: true,
        },
      ],
    };
  }

  create(dto: CreateBlogDto) {
    return dto;
  }

  getById(id: string) {
    return `blogs/${id}`;
  }

  update(id: string, dto: CreateBlogDto) {
    return `blogs/${id} ${dto}`;
  }

  delete(id: string) {
    return `blogs/${id}`;
  }
}
