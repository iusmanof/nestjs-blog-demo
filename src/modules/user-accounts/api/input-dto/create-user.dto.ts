import { IsString, Length, IsEmail } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Trim } from '../../../../core/decorators/transform/trim';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';

export class CreateUserDto {
  @IsString()
  @Length(3, 10)
  login: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsString()
  @IsEmail()
  email: string;
}

export class RegistrationUserInputDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;

  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
