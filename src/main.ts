import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  appSetup(app);
  await app.listen(process.env.MONGO_APP_PORT ?? 3000);
}
void bootstrap();
