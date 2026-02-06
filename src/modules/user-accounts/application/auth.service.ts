import { Injectable } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';
import { UsersQueryRepository } from '../infra/users.query-repository';
import { JwtService } from '@nestjs/jwt';
import { COOKIE_OPTIONS } from '../cookie/auth-cookie.config';

@Injectable()
class AuthService {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  setRefreshToken(res: ExpressResponse, token: string) {
    res.cookie('refreshToken', token, COOKIE_OPTIONS);
  }

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

    return { id: user.id.toString(), login: user.login };
  }

  // async login(userId: string) {
  //   return Promise.resolve({
  //     accessToken: this.jwtService.sign({ id: userId }),
  //   });
  // }
}

export default AuthService;
