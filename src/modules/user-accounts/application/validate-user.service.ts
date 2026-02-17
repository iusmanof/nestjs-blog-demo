import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../infra/users.query-repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';

@Injectable()
export class ValidateUserService {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user =
      await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);

    if (!user?.passwordHash) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id.toString(),
      login: user.login,
    };
  }
}
