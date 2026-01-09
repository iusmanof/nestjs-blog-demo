import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { BloggersPlatformModule } from '../modules/bloggers-platform/bloggers-platform.module';
import { TestingService } from './testing.service';
import { UserAccountsModule } from '../modules/user-accounts/user-accounts.module';

@Module({
  imports: [BloggersPlatformModule, UserAccountsModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
