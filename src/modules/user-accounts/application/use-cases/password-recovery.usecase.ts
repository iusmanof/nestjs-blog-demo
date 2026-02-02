import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryDto } from '../../api/input-dto/password-recovery.dto';
import { DomainException } from '../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/filters/domain-exception-codes';
import { UsersQueryRepository } from '../../infra/users.query-repository';
import { CodeGeneratorService } from '../code-generator.service';
import UsersRepository from '../../infra/users.repository';
import { EmailService } from '../../../notification/email.service';

export class PasswordRecoveryCommand {
  constructor(public dto: PasswordRecoveryDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly codeGeneratorService: CodeGeneratorService,
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersQueryRepository.findByEmail(command.dto.email);

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

    this.emailService
      .sendConfirmationEmail(user.email, recoveryCode)
      .catch(console.error);
  }
}
