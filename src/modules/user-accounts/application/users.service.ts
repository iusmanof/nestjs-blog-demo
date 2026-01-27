import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateUserDto,
  RegistrationUserInputDto,
} from '../api/input-dto/create-user.dto';
import UsersRepository from '../infra/users.repository';
import { UserDocument } from '../domain/user.entity';
import { UsersQueryRepository } from '../infra/users.query-repository';
import { CryptoService } from './crypto.service';
import { EmailService } from '../../notification/email.service';
import { DomainException } from '../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/filters/domain-exception-codes';
import { CodeGeneratorService } from './code-generator.service';

@Injectable()
class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly cryptoService: CryptoService,
    private readonly emailService: EmailService,
    private readonly codeGeneratorService: CodeGeneratorService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const createUser = {
      login: dto.login,
      email: dto.email,
      passwordHash,
    };

    return await this.usersRepository.create(createUser);
  }

  async delete(id: string): Promise<void> {
    const isDeleted = await this.usersRepository.delete(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }
  }

  async registerUser(dto: RegistrationUserInputDto) {
    const existingUser = await this.usersQueryRepository.findByLoginOrEmail(
      dto.email,
    );
    if (existingUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this email already exists',
        extensions: [{ field: 'email', message: 'Email already registered' }],
      });
    }

    const existingLogin = await this.usersQueryRepository.findByLoginOrEmail(
      dto.login,
    );
    if (existingLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this login already exists',
        extensions: [{ field: 'login', message: 'Login already taken' }],
      });
    }

    const confirmCode = this.codeGeneratorService.generateNumericCode(4);
    const createdUser = await this.create(dto);

    createdUser.setConfirmationCode(confirmCode);

    await this.usersRepository.save(createdUser);

    await this.emailService.sendConfirmationEmail(
      createdUser.email,
      confirmCode,
    );
  }

  async resendConfirmationCode(email: string): Promise<void> {
    const user = await this.usersQueryRepository.findByEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        extensions: [{ field: 'email', message: 'User not found' }],
      });
    }

    if (!user.emailConfirmation || user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        extensions: [{ field: 'email', message: 'Email already confirmed' }],
      });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.setConfirmationCode(newCode);
    await this.usersRepository.save(user);

    await this.emailService.sendConfirmationEmail(user.email, newCode);
  }

  async confirmUserByEmailCode(code: string): Promise<void> {
    const user = await this.usersQueryRepository.findByConfirmationCode(code);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid confirmation code',
        extensions: [{ field: 'code', message: 'Invalid code' }],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        extensions: [{ field: 'code', message: 'Email already confirmed' }],
      });
    }

    if (
      user.emailConfirmation.expiresAt &&
      user.emailConfirmation.expiresAt < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code expired',
        extensions: [{ field: 'code', message: 'Code expired' }],
      });
    }

    user.confirmEmail();
    await this.usersRepository.save(user);
  }

  async resetPassword({
    newPassword,
    recoveryCode,
  }: {
    newPassword: string;
    recoveryCode: string;
  }): Promise<void> {
    const user =
      await this.usersQueryRepository.findByRecoveryCode(recoveryCode);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid recovery code',
      });
    }

    if (
      !user.recoveryCodeExpiration ||
      user.recoveryCodeExpiration < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'Recovery code expired',
      });
    }

    user.passwordHash =
      await this.cryptoService.createPasswordHash(newPassword);

    // Сбрасываем код восстановления после успешной смены пароля
    user.recoveryCode = undefined;
    user.recoveryCodeExpiration = undefined;

    await this.usersRepository.save(user);
  }

  async sendPasswordRecoveryCode(email: string): Promise<void> {
    const user = await this.usersQueryRepository.findByEmail(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid recovery code',
        extensions: [{ field: 'recoveryCode', message: 'Invalid code' }],
      });
    }

    const recoveryCode = this.codeGeneratorService.generateNumericCode(6);

    user.recoveryCode = recoveryCode;
    user.recoveryCodeExpiration = new Date(Date.now() + 1000 * 60 * 15); // 15 минут

    await this.usersRepository.save(user);

    // Отправляем email (обрабатываем ошибки, но не кидаем)
    this.emailService
      .sendConfirmationEmail(user.email, recoveryCode)
      .catch(console.error);
  }

  async findById(id: string) {
    return this.usersQueryRepository.findById(id);
  }
}

export default UsersService;
