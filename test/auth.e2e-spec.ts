// import { Test } from '@nestjs/testing';
// import { AppModule } from '../src/app.module';
// import { Connection } from 'mongoose';
// import { getConnectionToken } from '@nestjs/mongoose';
// import createUserUtil from './utils/create-user.util';
// import { INestApplication } from '@nestjs/common';
// import request from 'supertest';
// import { appSetup } from '../src/setup/app.setup';
//
// class MailServiceMock {
//   send(to: string, subject: string, body: string) {
//     console.log(`MOCK Email sent to ${to} subj: ${subject} body: ${body}`);
//   }
// }
//
// describe('AuthController (e2e)', () => {
//   let app: INestApplication;
//   let connection: Connection;
//   const testLogin = 'user1';
//   const testPassword = 'password123';
//   const testEmail = 'user1@email.ma';
//   // TODO
//   // https://www.youtube.com/watch?v=8b6BtMz3ILk
//   // 1:46:37
//   let createdUserAccessToken: string;
//   // createUser and get accessToken
//   // request.set('Authorization', `Bearer  ${createdUserAccessToken}`}
//
//   beforeAll(async () => {
//     const moduleFixture = await Test.createTestingModule({
//       imports: [AppModule],
//     }) // TODO
//       // .overrideProvider(MailService)
//       // .useClass(MailServiceMock)
//       // .overrideProvider(AuthConfig)
//       // .useValue({
//       //   jwtSecret: '123',
//       // } as AuthConfig)
//       .compile();
//
//     app = moduleFixture.createNestApplication();
//     // pipesSetup(app);
//     appSetup(app);
//     await app.init();
//
//     connection = moduleFixture.get<Connection>(getConnectionToken());
//
//     if (!connection.db) {
//       throw new Error('MongoDB connection is not initialized');
//     }
//
//     const collections = await connection.db.listCollections().toArray();
//     for (const collection of collections) {
//       if (!collection.name.startsWith('system.')) {
//         await connection.db.collection(collection.name).deleteMany({});
//       }
//     }
//
//     const createdUser = await createUserUtil(app, {
//       login: testLogin,
//       password: testPassword,
//       email: testEmail,
//     });
//     createdUserId = createdUser.id;
//   });
//
//   afterAll(async () => {
//     await app.close();
//   });
//
//   it('[POST] /login should returb accessToken.', async () => {
//     const response = await request(app.getHttpServer())
//       .post('/login')
//       .send({
//         login: testLogin,
//         password: testPassword,
//       })
//       .expect(200);
//
//     const body = response.body as { accessToken: string };
//
//     expect(body).toHaveProperty('accessToken');
//     expect(typeof body.accessToken).toBe('string');
//   });
//
//   it('[POST] /login should return 400  inputModel has incorrect values', async () => {
//     await request(app.getHttpServer())
//       .post('/login')
//       .send({
//         incorrectValue: testLogin,
//       })
//       .expect(400);
//   });
//
//   it('[POST] /login should return 401  password or login or email is wrong', async () => {
//     await request(app.getHttpServer())
//       .post('/login')
//       .send({
//         login: testLogin,
//         password: 'wrongPassword',
//       })
//       .expect(401);
//   });
//
//   it('[POST] /login should return JWT token.', async () => {});
//   it('[POST] /login should return valid  JWT token1', async () => {});
// });
