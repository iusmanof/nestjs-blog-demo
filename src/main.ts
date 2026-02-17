import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  appSetup(app);
  const port = coreConfig.port;

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
void bootstrap();
