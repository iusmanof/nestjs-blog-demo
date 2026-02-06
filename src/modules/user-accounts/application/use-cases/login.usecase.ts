import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import AuthService from '../auth.service';
import { Response as ExpressResponse } from 'express';

export class LoginCommand {
  constructor(
    public userId: string,
    public res: ExpressResponse,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  execute(command: LoginCommand): Promise<{ accessToken: string }> {
    const accessToken = this.jwtService.sign(
      { id: command.userId },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { id: command.userId },
      { expiresIn: '7d' },
    );
    this.authService.setRefreshToken(command.res, refreshToken);

    return Promise.resolve({
      accessToken,
    });
  }
}
