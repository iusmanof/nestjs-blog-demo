import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { TestingModule } from './testing/testing.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CoreModule } from './core/core.module';
import { AppConfigModule } from './app-config.module';
import { MongooseConfigModule } from './mongoose-config.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseConfigModule,
    BloggersPlatformModule,
    UserAccountsModule,
    TestingModule,
    NotificationModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
