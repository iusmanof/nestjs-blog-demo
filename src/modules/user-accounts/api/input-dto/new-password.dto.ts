import { IsString, Length } from 'class-validator';

export class NewPasswordDto {
  @IsString()
  @Length(6, 20) // минимальная и максимальная длина пароля
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
