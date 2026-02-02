import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/filters/domain-exception-codes';
import { UsersQueryRepository } from '../../infra/users.query-repository';
import UsersRepository from '../../infra/users.repository';

export class RegistrationConfirmationCommand {
  constructor(public code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase implements ICommandHandler<RegistrationConfirmationCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}
  async execute(command: RegistrationConfirmationCommand): Promise<void> {
    const user = await this.usersQueryRepository.findByConfirmationCode(
      command.code,
    );

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
}
