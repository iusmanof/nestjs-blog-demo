import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  appSetup(app);
  await app.listen(process.env.MONGO_APP_PORT ?? 3000);
}
void bootstrap();
