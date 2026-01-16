import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/input-dto/create-blog.dto';

export interface BlogView {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
}

async function createBlogUtil(
  app: INestApplication,
  data: CreateBlogDto,
): Promise<BlogView> {
  const response = await request(app.getHttpServer())
    .post('/blogs')
    .send(data)
    .expect(201);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body = response.body;
  return body as BlogView;
}
export async function createMultipleBlogsUtil(
  app: INestApplication,
  count: number,
  baseData?: Partial<CreateBlogDto>,
): Promise<BlogView[]> {
  const blogs: BlogView[] = [];

  for (let i = 1; i <= count; i++) {
    const data: CreateBlogDto = {
      name: baseData?.name ? `${baseData.name}-${i}` : `Blog-${i}`,
      description: baseData?.description
        ? `${baseData.description}-${i}`
        : `Description for blog ${i}`,
      websiteUrl: baseData?.websiteUrl
        ? baseData.websiteUrl.replace(/\/$/, '') + `/blog${i}` // валидный URL
        : `https://example${i}.com`,
    };

    const response = await request(app.getHttpServer())
      .post('/blogs')
      .send(data)
      .expect(201); // здесь мы гарантируем, что POST успешный

    blogs.push(response.body as BlogView);
  }
  return blogs;
}

export default createBlogUtil;
