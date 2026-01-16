import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export interface PostView {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt?: string;
}

interface CreatePostInput {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export default async function createPostUtil(
  app: INestApplication,
  data: CreatePostInput,
): Promise<PostView> {
  const response = await request(app.getHttpServer())
    .post('/posts')
    .send(data)
    .expect(201);

  return response.body as PostView;
}
