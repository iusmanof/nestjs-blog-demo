import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../api/input-dto/create-user.dto';
import { CryptoService } from '../crypto.service';
import { UserViewDto } from '../../api/view-dto/user-view.dto';
import UsersRepository from '../../infra/users.repository';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  UserViewDto
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserViewDto> {
    const passwordHash = await this.cryptoService.createPasswordHash(
      command.dto.password,
    );

    const createUser = {
      login: command.dto.login,
      email: command.dto.email,
      passwordHash: passwordHash,
    };

    const entity = this.usersRepository.create(createUser);
    await this.usersRepository.save(entity);
    return UserViewDto.mapToView(entity);
  }
}
