import { INestApplication } from '@nestjs/common';
import createPostUtil, { PostView } from './utils/create-post.util';
import createBlogUtil from './utils/create-blog.util';
import request from 'supertest';
import { initApp } from './utils/helper';

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let blogId: string;
  let postId: string;

  const testTitle = 'TestPostTitle';
  const testShortDescription = 'TestShortdescription';
  const testContent = 'This is testContent';

  beforeAll(async () => {
    app = await initApp();

    const blog = await createBlogUtil(app, {
      name: 'Blog for posts',
      description: 'Blog description',
      websiteUrl: 'https://example.com',
    });
    blogId = blog.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[POST] /posts — create new post', async () => {
    const post = await createPostUtil(app, {
      title: testTitle,
      shortDescription: testShortDescription,
      content: testContent,
      blogId,
    });
    postId = post.id;

    expect(post.id).toBeDefined();
    expect(post.title).toBe(testTitle);
    expect(post.shortDescription).toBe(testShortDescription);
    expect(post.content).toBe(testContent);
    expect(post.blogId).toBe(blogId);
  });

  it('[GET] /posts/:id — get post by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .expect(200);

    const post = response.body as PostView;
    expect(post.id).toBe(postId);
    expect(post.title).toBe(testTitle);
    expect(post.shortDescription).toBe(testShortDescription);
    expect(post.content).toBe(testContent);
    expect(post.blogId).toBe(blogId);
  });

  it('[PUT] /posts/:id — update post', async () => {
    const updatedData = {
      title: 'Updated Title',
      shortDescription: 'Updated short description',
      content: 'Updated content',
      blogId, // blogId не меняется
    };

    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .send(updatedData)
      .expect(204);

    const response = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .expect(200);

    const post = response.body as PostView;
    expect(post.title).toBe(updatedData.title);
    expect(post.shortDescription).toBe(updatedData.shortDescription);
    expect(post.content).toBe(updatedData.content);
  });

  it('[DELETE] /posts/:id — delete post', async () => {
    await request(app.getHttpServer()).delete(`/posts/${postId}`).expect(204);

    await request(app.getHttpServer()).get(`/posts/${postId}`).expect(404);
  });
});
