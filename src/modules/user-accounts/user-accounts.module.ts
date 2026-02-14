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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ACCESS_TOKEN_SECRET'),
        // signOptions: {
        //   expiresIn: config.get<number>('ACCESS_TOKEN_EXPIRE_IN'),
        // },
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
  ],
  exports: [
    JwtModule,
    UsersRepository,
    UsersExternalService,
    SessionRepository,
  ],
})
export class UserAccountsModule {}
