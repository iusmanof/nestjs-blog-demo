import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { appSetup } from '../src/setup/app.setup';
import { EmailService } from '../src/modules/notification/email.service';
import { UsersQueryRepository } from '../src/modules/user-accounts/infra/users.query-repository';

class MailServiceMock {
  lastSentCode: string;

  // метод должен называться точно как в сервисе, который вызывается в UsersService
  sendConfirmationEmail(email: string, code: string) {
    this.lastSentCode = code;
    console.log(`MOCK Email sent to ${email} code: ${code}`);
  }

  // можно оставить send, если где-то используется
  send(to: string, subject: string, body: string) {
    const match = body.match(/code=([\w-]+)/);
    if (match) this.lastSentCode = match[1];
    console.log(
      `MOCK Email sent to ${to} subj: ${subject} code: ${this.lastSentCode}`,
    );
  }
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let mailService: MailServiceMock;
  let usersQueryRepository: UsersQueryRepository;
  let createdUserAccessToken;
  const testLogin = 'user1';
  const testPassword = 'password123';
  const testEmail = 'user1@email.ma';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useClass(MailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
    mailService = moduleFixture.get(EmailService);
    usersQueryRepository = moduleFixture.get(UsersQueryRepository);

    if (!connection.db) {
      throw new Error('MongoDB connection is not initialized');
    }

    // очистка БД
    const collections = await connection.db.listCollections().toArray();
    for (const collection of collections) {
      if (!collection.name.startsWith('system.')) {
        await connection.db.collection(collection.name).deleteMany({});
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('[POST] /auth/registration — should register new user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: testLogin,
        password: testPassword,
        email: testEmail,
      })
      .expect(204);
  });

  it('[POST] /auth/registration-email-resending — should send confirmation code', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: testEmail })
      .expect(204);

    expect(mailService.lastSentCode).toBeDefined();
  });

  it('[POST] /auth/registration-confirmation — should confirm registration', async () => {
    const code = mailService.lastSentCode;
    expect(code).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({ code })
      .expect(204);

    // проверим, что пользователь действительно подтверждён
    const user = await usersQueryRepository.findByEmail(testEmail);
    expect(user.emailConfirmation.isConfirmed).toBe(true);
  });

  it('[POST] /auth/login — should login successfully after confirmation', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: testLogin, password: testPassword })
      .expect(200);

    const body = response.body as { accessToken: string };
    expect(body.accessToken).toBeDefined();
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(10);

    createdUserAccessToken = body.accessToken;
  });

  it('[POST] /auth/login — should return 401 for wrong password', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: testLogin, password: 'wrongPassword' })
      .expect(401);
  });

  it('[POST] /auth/login — should return 401 for wrong body', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ wrongField: 'invalid' })
      .expect(401);
  });

  it('[POST] /auth/login — should return valid JWT token structure', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: testLogin, password: testPassword })
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = response.body.accessToken as string;
    const parts = token.split('.');
    expect(parts.length).toBe(3); // JWT должен иметь 3 части
  });
});
