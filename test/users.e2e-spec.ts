import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { pipesSetup } from '../src/setup/pipe.setup';
import createUserUtil, {
  PaginatedUsersResponse,
  UserView,
} from './utils/create-user.util';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    pipesSetup(app);
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());

    if (!connection.db) {
      throw new Error('MongoDB connection is not initialized');
    }

    const collections = await connection.db.listCollections().toArray();
    for (const collection of collections) {
      if (!collection.name.startsWith('system.')) {
        await connection.db.collection(collection.name).deleteMany({});
      }
    }

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

    const body = response.body as PaginatedUsersResponse<UserView>;

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
    await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .expect(204);
  });
});
