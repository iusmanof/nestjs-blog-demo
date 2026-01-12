import { ConfigModule } from '@nestjs/config';

export const AppConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    `.env.production`,
  ].filter(Boolean),
});
