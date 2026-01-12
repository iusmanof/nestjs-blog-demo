import { ConfigModule } from '@nestjs/config';

export const AppConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [`.env.${process.env.NODE_ENV}`],
  // envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`],
});
