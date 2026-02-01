import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

export class LoginCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(private readonly jwtService: JwtService) {}

  execute(command: LoginCommand): Promise<{ accessToken: string }> {
    return Promise.resolve({
      accessToken: this.jwtService.sign({ id: command.userId }),
    });
  }
}
