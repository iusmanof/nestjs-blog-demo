import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}
@Injectable()
export class CoreConfig {
  @IsNumber({}, { message: 'Set Env variable PORT, example: 3000' })
  port!: number;

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoURI!: string;

  @IsEnum(Environments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env!: Environments;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE, example: true (true/false/0/1)',
  })
  includeTestingModule!: boolean;

  @IsBoolean({
    message:
      'Set Env variable SEND_INTERNAL_SERVER_ERROR_DETAILS, example: true (true/false/0/1)',
  })
  sendInternalServerErrorDetails!: boolean;

  constructor(private readonly configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('MONGO_APP_PORT'));
    this.mongoURI = this.configService.get('MONGO_DB_URI');
    this.env = this.configService.get('NODE_ENV');

    this.includeTestingModule = configValidationUtility.convertToBoolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    ) as boolean;

    this.sendInternalServerErrorDetails =
      configValidationUtility.convertToBoolean(
        this.configService.get('SEND_INTERNAL_SERVER_ERROR_DETAILS'),
      ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}
