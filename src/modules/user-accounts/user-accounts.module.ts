import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import UsersService from './application/users.service';
import { UsersQueryRepository } from './infra/users.query-repository';
import { SecurityDevicesController } from './api/security-devices.controller';
import UsersRepository from './infra/users.repository';
import UsersController from './api/users.controller';
import { AuthController } from './api/auth.controller';
import UsersExternalRepository from './infra/users.external-repository';
import UsersExternalService from './application/users.external-service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    UsersExternalService,
    UsersExternalRepository,
  ],
  exports: [UsersExternalService, UsersExternalRepository, UsersRepository],
})
export class UserAccountsModule {}
