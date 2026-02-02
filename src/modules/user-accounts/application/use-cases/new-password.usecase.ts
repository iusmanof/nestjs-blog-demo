import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordDto } from '../../api/input-dto/new-password.dto';
import { DomainException } from '../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/filters/domain-exception-codes';
import { UsersQueryRepository } from '../../infra/users.query-repository';
import { CryptoService } from '../crypto.service';
import UsersRepository from '../../infra/users.repository';

export class NewPasswordCommand {
  constructor(public dto: NewPasswordDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly cryptoService: CryptoService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: NewPasswordCommand): Promise<void> {
    const user = await this.usersQueryRepository.findByRecoveryCode(
      command.dto.recoveryCode,
    );

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

    user.passwordHash = await this.cryptoService.createPasswordHash(
      command.dto.newPassword,
    );

    user.recoveryCode = undefined;
    user.recoveryCodeExpiration = undefined;

    await this.usersRepository.save(user);
  }
}
