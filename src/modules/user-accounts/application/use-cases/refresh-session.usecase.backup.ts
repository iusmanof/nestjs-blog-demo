// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { RefreshSession } from '../../../../core/types/refresh-session.type';
// import { ConfigService } from '@nestjs/config';
// import { UsersQueryRepository } from '../../infra/users.query-repository';
// import { JwtService } from '@nestjs/jwt';
// import { UnauthorizedException } from '@nestjs/common';
// import { SessionRepository } from '../../infra/session.repository';
// import * as bcrypt from 'bcrypt';
//
// export class RefreshSessionCommand {
//   constructor(public readonly refreshToken: string) {}
// }
//
// @CommandHandler(RefreshSessionCommand)
// export class RefreshSessionUseCase implements ICommandHandler<RefreshSessionCommand> {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//     private readonly usersQueryRepository: UsersQueryRepository,
//     private readonly sessionRepository: SessionRepository,
//   ) {}
//
//   async execute(command: RefreshSessionCommand): Promise<RefreshSession> {
//     const { refreshToken } = command;
//
//     // Проверяем JWT
//     let payload: { deviceId: string; userId: string; iat: number };
//     try {
//       payload = this.jwtService.verify(refreshToken, {
//         secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')!,
//       });
//     } catch {
//       throw new UnauthorizedException('Invalid or expired refresh token');
//     }
//
//     // Ищем сессию по deviceId
//     const session = await this.sessionRepository.findByDeviceId(
//       payload.deviceId,
//     );
//     const currentHash = await this.sessionRepository.getCurrentRefreshTokenHash(
//       payload.deviceId,
//     );
//     console.log('/refresh-token CURRENT rt Hash:    ' + currentHash);
//
//     // if (!session || session.userId !== payload.userId) {
//     if (!session) {
//       throw new UnauthorizedException('Session not found or invalid');
//     }
//     console.log(
//       '/refresh-token OLD rt Hash:        ' + session.refreshTokenHash,
//     );
//
//     const blackList = await this.sessionRepository.getBlacklist(
//       payload.deviceId,
//     );
//
//     for (const el of blackList) {
//       console.log('blackList: ' + el);
//     }
//
//     if (blackList.includes(currentHash)) {
//       throw new UnauthorizedException('Refresh token in BlackList');
//     }
//     // Проверяем blacklist
//     // const isBlacklisted =
//     //   await this.sessionRepository.isRefreshTokenBlacklisted(
//     //     session.deviceId,
//     //     refreshToken,
//     //   );
//     // console.log('FIND IN Blacklist             ' + isBlacklisted);
//     // if (isBlacklisted) {
//     //   throw new UnauthorizedException('Refresh token has been invalidated');
//     // }
//
//     // Проверяем валидность hash
//     const isValid = await bcrypt.compare(
//       refreshToken,
//       session.refreshTokenHash,
//     );
//     if (!isValid) {
//       throw new UnauthorizedException('Invalid refresh token');
//     }
//
//     // Проверяем expiration
//     if (session.expiresAt < new Date()) {
//       throw new UnauthorizedException('Session expired');
//     }
//
//     // Добавляем текущий refresh token в blacklist
//
//     // Находим пользователя
//     const user = await this.usersQueryRepository.findById(session.userId);
//     if (!user) throw new UnauthorizedException('User not found');
//
//     // Генерация новых токенов
//     const accessToken = this.jwtService.sign(
//       { id: user.id },
//       {
//         secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')!,
//         expiresIn: '110s',
//       },
//     );
//
//     const newRefreshToken = this.jwtService.sign(
//       { userId: user.id, deviceId: session.deviceId },
//       {
//         secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')!,
//         expiresIn: '120s',
//       },
//     );
//
//     // Обновляем hash нового refresh token в сессии
//     const newHash = await bcrypt.hash(newRefreshToken, 10);
//     const decodedNew: { iat: number; exp: number } =
//       this.jwtService.decode(newRefreshToken);
//
//     await this.sessionRepository.updateRefreshTokenHash(
//       session.deviceId,
//       newHash,
//       new Date(decodedNew.iat * 1000),
//       new Date(decodedNew.exp * 1000),
//     );
//
//     // console.log('/refresh-token OLD rt Hash:        ' + session.refreshTokenHash);
//     console.log('/refresh-token NEW rt Hash:        ' + newHash);
//
//     // await this.sessionRepository.deleteByDeviceId(payload.deviceId);
//     await this.sessionRepository.addToBlacklist(session.deviceId, currentHash);
//
//     return { accessToken, newRefreshToken };
//   }
// }
