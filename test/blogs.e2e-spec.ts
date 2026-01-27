import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import createBlogUtil, {
  BlogView,
  createMultipleBlogsUtil,
} from './utils/create-blog.util';
import { PostView } from './utils/create-post.util';
import { PaginatedResponse } from './utils/paginated-response';
import { initApp } from './utils/helper';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let createBlogId: string;
  const testName = 'blogName';
  const testDescription = 'blogDescription';
  const testWebsiteUrl = 'https://example.com';
  const testTitle = 'string';
  const testContent = 'string';
  let postId: string;

  beforeAll(async () => {
    app = await initApp();

    const createdBlog = await createBlogUtil(app, {
      name: testName,
      description: testDescription,
      websiteUrl: testWebsiteUrl,
    });
    createBlogId = createdBlog.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /blogs', async () => {
    const createdBlogs = await createMultipleBlogsUtil(app, 5, {
      name: 'blogName',
      description: 'blogDescription',
      websiteUrl: 'https://example.com',
    });

    const response = await request(app.getHttpServer())
      .get('/blogs')
      .expect(200);

    const body = response.body as PaginatedResponse<BlogView>;

    expect(body.items).toBeInstanceOf(Array);
    expect(body.items.length).toBeGreaterThanOrEqual(5);

    const firstBLog = body.items[0];
    expect(firstBLog).toHaveProperty('id');
    expect(firstBLog).toHaveProperty('name');
    expect(firstBLog).toHaveProperty('description');
    expect(firstBLog).toHaveProperty('websiteUrl');

    // pagination structure
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('totalCount');
    expect(body).toHaveProperty('pagesCount');
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('pageSize');

    // pagination type
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.totalCount).toBe('number');
    expect(typeof body.pagesCount).toBe('number');
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);

    const returnedIds = body.items.map((b) => b.id);
    createdBlogs.forEach((blog) => {
      expect(returnedIds).toContain(blog.id);
    });
  });

  it('[GET] /blogs/:id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/blogs/${createBlogId}`)
      .expect(200);
    const body = response.body as BlogView;

    expect(body.id).toBeDefined();
    expect(body.id).toBe(createBlogId);
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('description');
    expect(body).toHaveProperty('websiteUrl');

    expect(body.name).toBe(testName);
    expect(body.description).toBe(testDescription);
    expect(body.websiteUrl).toBe(testWebsiteUrl);
  });

  it('[POST] /blogs', async () => {
    const data = {
      name: testName,
      description: testDescription,
      websiteUrl: testWebsiteUrl,
    };
    const response = await request(app.getHttpServer())
      .post('/blogs')
      .send(data)
      .expect(201);

    const body = response.body as BlogView;

    expect(body.id).toBeDefined();
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('description');
    expect(body).toHaveProperty('websiteUrl');

    expect(body.name).toBe(testName);
    expect(body.description).toBe(testDescription);
    expect(body.websiteUrl).toBe(testWebsiteUrl);
  });

  it('[PUT] /blogs/:id', async () => {
    const data = {
      name: 'updatedName',
      description: 'updatedDescription',
      websiteUrl: 'https://updated.example.com',
    };

    await request(app.getHttpServer())
      .put(`/blogs/${createBlogId}`)
      .send(data)
      .expect(204);

    const response = await request(app.getHttpServer())
      .get(`/blogs/${createBlogId}`)
      .expect(200);

    const body = response.body as BlogView;

    expect(body.name).not.toBe(testName);
    expect(body.description).not.toBe(testDescription);
    expect(body.websiteUrl).not.toBe(testWebsiteUrl);

    expect(body.name).toBe('updatedName');
    expect(body.description).toBe('updatedDescription');
    expect(body.websiteUrl).toBe('https://updated.example.com');
  });

  it('[POST] /blogs/:blogId/posts', async () => {
    const data = {
      title: testTitle,
      shortDescription: testDescription,
      content: testContent,
    };

    const response = await request(app.getHttpServer())
      .post(`/blogs/${createBlogId}/posts`)
      .send(data)
      .expect(201);

    const body = response.body as PostView;
    postId = body.id;
  });

  it('[GET] /blogs/:blogId/posts', async () => {
    const response = await request(app.getHttpServer())
      .get(`/blogs/${createBlogId}/posts`)
      .expect(200);

    const body = response.body as PaginatedResponse<PostView>;

    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);

    const post = body.items.find((p) => p.id === postId);
    expect(post).toBeDefined();

    if (!post) {
      throw new Error('Post not found in response');
    }

    expect(post.title).toBe(testTitle);
    expect(post.shortDescription).toBe(testDescription);
    expect(post.content).toBe(testContent);
  });

  it('[DELETE] /blogs/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/blogs/${createBlogId}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/blogs/${createBlogId}`)
      .expect(404);
  });
});
