import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';
import { UsersQueryRepository } from '../infra/users.query-repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
class AuthService {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersQueryRepository.findByLoginOrEmail(login);

    if (!user) {
      return null;
    }

    if (!user.passwordHash) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  // async login(userId: string) {
  //   return Promise.resolve({
  //     accessToken: this.jwtService.sign({ id: userId }),
  //   });
  // }
}

export default AuthService;
