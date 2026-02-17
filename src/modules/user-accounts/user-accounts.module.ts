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
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from './application/crypto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '../notification/notification.module';
import { CoreModule } from '../../core/core.module';
import { JwtStrategy } from '../../core/guards/bearer/jwt.stategy';
import { CodeGeneratorService } from './application/code-generator.service';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { GetUsersQueryHandler } from './application/queries/get-users.query-handler';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { RegisterUserUseCase } from './application/use-cases/register-user.usecase';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.usecase';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.usecase';
import { NewPasswordUseCase } from './application/use-cases/new-password.usecase';
import { PasswordRecoveryUseCase } from './application/use-cases/password-recovery.usecase';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query-handler';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.usecase';
import { LogoutUseCase } from './application/use-cases/logout.usecase';
import { SessionRepository } from './infra/session.repository';
import { Session, SessionSchema } from './domain/session.entity';
import { GetDevicesQueryHandler } from './application/queries/get-devices.query-handler';
import { DeleteAllDevicesUseCase } from './application/use-cases/delete-all-devices.useacse';
import { DeleteDeviceUseCase } from './application/use-cases/delete-device.command';
import { ValidateUserService } from './application/validate-user.service';
import { UserAccountsConfig } from './config/user-accounts.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';

const services = [
  UsersService,
  UsersExternalService,
  CryptoService,
  CodeGeneratorService,
  ValidateUserService,
];
const repositories = [
  UsersQueryRepository,
  UsersRepository,
  UsersExternalRepository,
  SessionRepository,
];
const strategies = [LocalStrategy, JwtStrategy];
const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  LoginUseCase,
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  RefreshSessionUseCase,
  LogoutUseCase,
  DeleteAllDevicesUseCase,
  DeleteDeviceUseCase,
];
const handlers = [
  GetUsersQueryHandler,
  GetUserByIdQueryHandler,
  GetDevicesQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    CoreModule,
    PassportModule,
    ConfigModule,
    NotificationModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],

  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UserAccountsConfig,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.accessTokenSecret,
          signOptions: {
            expiresIn: userAccountConfig.accessTokenExpireIn,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.refreshTokenSecret,
          signOptions: {
            expiresIn: userAccountConfig.refreshTokenExpireIn,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    ...services,
    ...repositories,
    ...strategies,
    ...useCases,
    ...handlers,
  ],
  exports: [
    ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
    REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
    UsersRepository,
    UsersExternalService,
    SessionRepository,
  ],
})
export class UserAccountsModule {}
