import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import UsersService from './application/users.service';
import { UsersQueryRepository } from './infra/users.query-repository';
import UsersRepository from './infra/users.repository';
import UsersController from './api/users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersQueryRepository, UsersRepository],
  exports: [UsersRepository],
})
export class UserAccountsModule {}
