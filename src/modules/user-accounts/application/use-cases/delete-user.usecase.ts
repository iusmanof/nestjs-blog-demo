import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import UsersRepository from '../../infra/users.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: DeleteUserCommand): Promise<void> {
    const isDeleted = await this.usersRepository.delete(command.id);

    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
}
