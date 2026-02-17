import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../../setup/config-validation.utility';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({
    message:
      'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 10 = 10 seconds',
  })
  accessTokenExpireIn!: number;

  @IsNotEmpty({
    message:
      'Set Env variable REFRESH_TOKEN_EXPIRE_IN, examples: 20 = 20 seconds',
  })
  refreshTokenExpireIn!: number;

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret!: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret!: string;

  constructor(private readonly configService: ConfigService<any, true>) {
    this.accessTokenExpireIn = Number(
      this.configService.get<string>('ACCESS_TOKEN_EXPIRE_IN'),
    );

    this.refreshTokenExpireIn = Number(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRE_IN'),
    );

    this.refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    this.accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );

    configValidationUtility.validateConfig(this);
  }
}
