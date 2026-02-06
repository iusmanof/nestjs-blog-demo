import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../guards/decorators/extract-user-from-request.decorator';
import { RegistrationUserInputDto } from './input-dto/create-user.dto';
import { NewPasswordDto } from './input-dto/new-password.dto';
import { PasswordRecoveryDto } from './input-dto/password-recovery.dto';
import { MeViewDto } from './view-dto/me-view.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../core/guards/bearer/jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from '../application/use-cases/login.usecase';
import { RegisterUserCommand } from '../application/use-cases/register-user.usecase';
import { RegistrationConfirmationCommand } from '../application/use-cases/registration-confirmation.usecase';
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.usecase';
import { NewPasswordCommand } from '../application/use-cases/new-password.usecase';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.usecase';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query-handler';
import type { Response as ExpressResponse } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @SkipThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ accessToken: string }> {
    return this.commandBus.execute(new LoginCommand(user.id, res));
  }

  @Post('password-recovery')
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() dto: PasswordRecoveryDto): Promise<void> {
    return await this.commandBus.execute(new PasswordRecoveryCommand(dto));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() dto: NewPasswordDto): Promise<void> {
    return await this.commandBus.execute(new NewPasswordCommand(dto));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body('code') code: string): Promise<void> {
    return await this.commandBus.execute(
      new RegistrationConfirmationCommand(code),
    );
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: RegistrationUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(@Body('email') email: string): Promise<void> {
    return await this.commandBus.execute(
      new RegistrationEmailResendingCommand(email),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<MeViewDto> {
    return await this.queryBus.execute(new GetUserByIdQuery(user));
  }
}
