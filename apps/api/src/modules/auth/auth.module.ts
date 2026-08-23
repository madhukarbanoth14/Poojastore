import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SMS_SENDER } from './application/ports/sms-sender.port';
import { RequestOtpUseCase } from './application/use-cases/request-otp.use-case';
import { SocialLoginUseCase } from './application/use-cases/social-login.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp.use-case';
import { ConsoleSmsSender } from './infrastructure/console-sms.sender';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { TokenService } from './infrastructure/token.service';
import { TwilioSmsSender } from './infrastructure/twilio-sms.sender';
import { AdminUsersController } from './presentation/admin-users.controller';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.accessSecret'),
      }),
    }),
  ],
  controllers: [AuthController, AdminUsersController],
  providers: [
    RequestOtpUseCase,
    VerifyOtpUseCase,
    SocialLoginUseCase,
    TokenService,
    JwtStrategy,
    ConsoleSmsSender,
    TwilioSmsSender,
    {
      provide: SMS_SENDER,
      inject: [ConfigService, ConsoleSmsSender, TwilioSmsSender],
      useFactory: (
        config: ConfigService,
        consoleSender: ConsoleSmsSender,
        twilioSender: TwilioSmsSender,
      ) => {
        const provider = config.get<string>('smsProvider') ?? 'console';
        if (provider === 'twilio') return twilioSender;
        return consoleSender;
      },
    },
  ],
  exports: [TokenService],
})
export class AuthModule {}
