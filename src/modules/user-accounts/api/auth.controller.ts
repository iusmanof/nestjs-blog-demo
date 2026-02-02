import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import UsersService from '../application/users.service';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import AuthService from '../application/auth.service';
import { ExtractUserFromRequest } from '../guards/decorators/extract-user-from-request.decorator';
import { RegistrationUserInputDto } from './input-dto/create-user.dto';
import { NewPasswordDto } from './input-dto/new-password.dto';
import { PasswordRecoveryDto } from './input-dto/password-recovery.dto';
import { MeViewDto } from './view-dto/me-view.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../application/use-cases/login.usecase';
import { RegisterUserCommand } from '../application/use-cases/register-user.usecase';
import { RegistrationConfirmationCommand } from '../application/use-cases/registration-confirmation.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.commandBus.execute(new LoginCommand(user.id));
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: RegistrationUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body('code') code: string): Promise<void> {
    return await this.commandBus.execute(
      new RegistrationConfirmationCommand(code),
    );
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(@Body('email') email: string): Promise<void> {
    await this.usersService.resendConfirmationCode(email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() body: NewPasswordDto): Promise<void> {
    await this.usersService.resetPassword(body);
  }

  @Post('password-recovery')
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryDto): Promise<void> {
    await this.usersService.sendPasswordRecoveryCode(body.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<MeViewDto> {
    const fullUser = await this.usersService.findById(user.id);

    if (!fullUser) {
      throw new NotFoundException('User not found');
    }
    return MeViewDto.map(fullUser);
  }
}
