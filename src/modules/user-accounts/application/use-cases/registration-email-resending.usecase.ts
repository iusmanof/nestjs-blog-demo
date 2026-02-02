import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/filters/domain-exception-codes';
import { UsersQueryRepository } from '../../infra/users.query-repository';
import { EmailService } from '../../../notification/email.service';
import UsersRepository from '../../infra/users.repository';

export class RegistrationEmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    const user = await this.usersQueryRepository.findByEmail(command.email);

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
}
