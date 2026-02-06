import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import AuthService from '../../application/auth.service';
import { DomainException } from '../../../../core/exceptions/filters/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/filters/domain-exception-codes';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
      passwordField: 'password',
    });
  }

  async validate(loginOrEmail: string, password: string) {
    const user = await this.authService.validateUser(loginOrEmail, password);
    if (!user) {
      // throw new UnauthorizedException();
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User is not unauthorized',
      });
    }
    return user;
  }
}
