import { INestApplication } from '@nestjs/common';
import createPostUtil, { PostView } from './utils/create-post.util';
import createBlogUtil from './utils/create-blog.util';
import request from 'supertest';
import { initApp } from './utils/helper';
import { PostPaginatedViewDto } from '../src/modules/bloggers-platform/posts/api/view-dto/post-paginated.view.dto';

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

  describe('[GET] /posts — get all posts', () => {
    it('should return paginated posts with default pagination', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      const body = response.body as PostPaginatedViewDto<PostView>;
      expect(body).toHaveProperty('pagesCount');
      expect(body).toHaveProperty('page');
      expect(body).toHaveProperty('pageSize');
      expect(body).toHaveProperty('totalCount');
      expect(body).toHaveProperty('items');
      expect(Array.isArray(body.items)).toBe(true);

      if (body.items.length > 0) {
        const post = body.items[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('shortDescription');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('blogId');
        expect(post).toHaveProperty('blogName');
        expect(post).toHaveProperty('createdAt');
        expect(post).toHaveProperty('extendedLikesInfo');
        // expect(post.extendedLikesInfo).toHaveProperty('likesCount');
        // expect(post.extendedLikesInfo).toHaveProperty('dislikesCount');
        // expect(post.extendedLikesInfo).toHaveProperty('myStatus');
        // expect(post.extendedLikesInfo).toHaveProperty('newestLikes');
        // expect(Array.isArray(post.extendedLikesInfo.newestLikes)).toBe(true);
      }
    });

    it('should return posts sorted by title ascending', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get('/posts')
        .query({ sortBy: 'title', sortDirection: 'asc' })
        .expect(200);

      const body = response.body as PostPaginatedViewDto<PostView>;
      const items = body.items;

      if (items.length > 1) {
        for (let i = 1; i < items.length; i++) {
          expect(items[i - 1].title <= items[i].title).toBe(true);
        }
      }
    });
  });

  it('[GET] /posts/:id — get post by id', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .send(updatedData)
      .expect(204);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .expect(200);

    const post = response.body as PostView;
    expect(post.title).toBe(updatedData.title);
    expect(post.shortDescription).toBe(updatedData.shortDescription);
    expect(post.content).toBe(updatedData.content);
  });

  it('[DELETE] /posts/:id — delete post', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).delete(`/posts/${postId}`).expect(204);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).get(`/posts/${postId}`).expect(404);
  });
});
