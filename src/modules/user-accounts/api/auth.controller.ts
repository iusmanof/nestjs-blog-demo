import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../guards/decorators/extract-user-from-request.decorator';
import { RegistrationUserInputDto } from './input-dto/create-user.dto';
import { NewPasswordDto } from './input-dto/new-password.dto';
import { PasswordRecoveryDto } from './input-dto/password-recovery.dto';
import { MeViewDto } from './view-dto/me-view.dto';
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
import type { AuthenticatedRequest } from '../../../core/types/authenticated-request.interface';
import { COOKIE_OPTIONS } from '../cookie/auth-cookie.config';
import { LoginResult } from '../../../core/types/login.result';
import { RefreshSession } from '../../../core/types/refresh-session.type';
import { LogoutCommand } from '../application/use-cases/logout.usecase';
import { RefreshSessionCommand } from '../application/use-cases/refresh-session.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: RegistrationUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ accessToken: string }> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      '';

    const userAgent = req.headers['user-agent'] || 'unknown';

    const result: LoginResult = await this.commandBus.execute(
      new LoginCommand(user.id, ip, userAgent),
    );

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    return { accessToken: result.accessToken };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshSession(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result: RefreshSession = await this.commandBus.execute(
      new RefreshSessionCommand(refreshToken),
    );

    res.cookie('refreshToken', result.newRefreshToken, COOKIE_OPTIONS);

    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutSession(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    await this.commandBus.execute(new LogoutCommand(refreshToken));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<MeViewDto> {
    return await this.queryBus.execute(new GetUserByIdQuery(user));
  }

  @Post('password-recovery')
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

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(@Body('email') email: string): Promise<void> {
    return await this.commandBus.execute(
      new RegistrationEmailResendingCommand(email),
    );
  }
}
