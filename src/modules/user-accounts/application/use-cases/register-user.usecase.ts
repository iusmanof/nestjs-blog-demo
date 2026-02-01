import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationUserInputDto } from '../../api/input-dto/create-user.dto';
import { UsersQueryRepository } from '../../infra/users.query-repository';
import { CodeGeneratorService } from '../code-generator.service';
import { DomainException } from '../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/filters/domain-exception-codes';
import UsersRepository from '../../infra/users.repository';
import { EmailService } from '../../../notification/email.service';
import { CryptoService } from '../crypto.service';

export class RegisterUserCommand {
  constructor(public body: RegistrationUserInputDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly codeGeneratorService: CodeGeneratorService,
    private readonly emailService: EmailService,
    private readonly cryptoService: CryptoService,
  ) {}
  async execute(command: RegisterUserCommand): Promise<any> {
    const existingUser = await this.usersQueryRepository.findByLoginOrEmail(
      command.body.email,
    );
    if (existingUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this email already exists',
        extensions: [{ field: 'email', message: 'Email already registered' }],
      });
    }

    const existingLogin = await this.usersQueryRepository.findByLoginOrEmail(
      command.body.login,
    );
    if (existingLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this login already exists',
        extensions: [{ field: 'login', message: 'Login already taken' }],
      });
    }

    const confirmCode = this.codeGeneratorService.generateNumericCode(4);

    const passwordHash = await this.cryptoService.createPasswordHash(
      command.body.password,
    );

    const createdUser = this.usersRepository.create({
      login: command.body.login,
      email: command.body.email,
      passwordHash,
    });

    createdUser.setConfirmationCode(confirmCode);

    await this.usersRepository.save(createdUser);

    await this.emailService.sendConfirmationEmail(
      createdUser.email,
      confirmCode,
    );
  }
}
