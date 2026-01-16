import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface UserView {
  id: string;
  login: string;
  email: string;
}

async function createUserUtil(
  app: INestApplication,
  data: { login: string; password: string; email: string },
): Promise<UserView> {
  const response = await request(app.getHttpServer())
    .post('/users')
    .send(data)
    .expect(201);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body = response.body;
  return body as UserView;
}

export default createUserUtil;
