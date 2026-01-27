import { INestApplication } from '@nestjs/common';
import request from 'supertest';
// import { Connection } from 'mongoose';
import createUserUtil, { UserView } from './utils/create-user.util';
import { PaginatedResponse } from './utils/paginated-response';
import { initApp } from './utils/helper';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  // let connection: Connection;
  let createdUserId: string;

  beforeAll(async () => {
    app = await initApp();

    const createdUser = await createUserUtil(app, {
      login: 'user1',
      password: 'password123',
      email: 'user1@email.ma',
    });
    createdUserId = createdUser.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[POST] /users — should create user', async () => {
    const createdUser = await createUserUtil(app, {
      login: 'user2',
      password: 'password2',
      email: 'user2@mail.com',
    });

    expect(createdUser.login).toBe('user2');
    expect(createdUser.email).toBe('user2@mail.com');
  });

  it('[GET] /users — should return users list', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    const body = response.body as PaginatedResponse<UserView>;

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
  });

  it('[DELETE] /users/:id — should return 404 for deleted user', async () => {
    await request(app.getHttpServer() as unknown as Express.Application)
      .delete(`/users/${createdUserId}`)
      .expect(204);
  });
});
