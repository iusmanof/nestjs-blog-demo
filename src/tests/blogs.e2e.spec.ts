import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { Test } from '@nestjs/testing';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/blogs (GET) returns blogs with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/blogs')
      .expect(200);

    const body = response.body as PaginatedBlogsResponse;

    expect(body.pagesCount).toEqual(expect.any(Number));
    expect(body.page).toEqual(expect.any(Number));
    expect(body.pageSize).toEqual(expect.any(Number));
    expect(body.totalCount).toEqual(expect.any(Number));
    expect(Array.isArray(body.items)).toBe(true);
  });
});

interface PaginatedBlogsResponse {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogDto[];
}

interface BlogDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}
