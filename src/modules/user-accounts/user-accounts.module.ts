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
import { JwtModule } from '@nestjs/jwt';
import AuthService from './application/auth.service';
import { CryptoService } from './application/crypto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationModule } from '../notification/notification.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CoreModule } from '../../core/core.module';
import { JwtStrategy } from './guards/bearer/jwt.stategy';
import { CodeGeneratorService } from './application/code-generator.service';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { GetUsersQueryHandler } from './application/queries/get-users.query-handler';

const services = [
  UsersService,
  UsersExternalService,
  AuthService,
  CryptoService,
  CodeGeneratorService,
];
const repositories = [
  UsersQueryRepository,
  UsersRepository,
  UsersExternalRepository,
];
const strategies = [LocalStrategy, JwtStrategy];
const useCases = [CreateUserUseCase, DeleteUserUseCase];
const handlers = [GetUsersQueryHandler];

@Module({
  imports: [
    CqrsModule,
    CoreModule,
    PassportModule,
    ConfigModule,
    NotificationModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '300s',
        },
      }),
    }),
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    ...services,
    ...repositories,
    ...strategies,
    ...useCases,
    ...handlers,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [JwtModule, UsersRepository, UsersExternalService],
})
export class UserAccountsModule {}
