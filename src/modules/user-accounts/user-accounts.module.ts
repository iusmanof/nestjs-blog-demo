import { Module } from '@nestjs/common';
import UsersController from './api/users.controller';
import UsersService from './application/users.service';

@Module({})
export class UserAccountsModule {
  controllers: [UsersController];
  providers: [UsersService];
  exports: [];
}
