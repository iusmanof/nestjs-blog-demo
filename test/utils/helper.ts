import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

export const initApp = async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  appSetup(app);
  await app.init();

  await clearDB(moduleFixture);
  return app;
};

export const clearDB = async (moduleFixture: TestingModule) => {
  const connection = moduleFixture.get<Connection>(getConnectionToken());

  if (!connection.db) {
    throw new Error('MongoDB connection is not initialized');
  }

  const collections = await connection.db.listCollections().toArray();
  for (const collection of collections) {
    if (!collection.name.startsWith('system.')) {
      await connection.db.collection(collection.name).deleteMany({});
    }
  }
};
