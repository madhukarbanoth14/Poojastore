import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../domain/authenticated-user';
import { RequestOtpUseCase } from '../application/use-cases/request-otp.use-case';
import { LoginWithPasswordUseCase } from '../application/use-cases/login-with-password.use-case';
import { RegisterAccountUseCase } from '../application/use-cases/register-account.use-case';
import { SocialLoginUseCase } from '../application/use-cases/social-login.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { VerifyOtpUseCase } from '../application/use-cases/verify-otp.use-case';
import { TokenService } from '../infrastructure/token.service';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  LogoutDto,
  RefreshTokenDto,
  RequestOtpDto,
  SocialLoginDto,
  VerifyOtpDto,
} from './dto/request-otp.dto';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/password-auth.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { SocialProvider } from '@prisma/client';
import { parseMobileInput } from '../domain/phone';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly requestOtp: RequestOtpUseCase,
    private readonly verifyOtp: VerifyOtpUseCase,
    private readonly registerAccount: RegisterAccountUseCase,
    private readonly loginWithPassword: LoginWithPasswordUseCase,
    private readonly changePassword: ChangePasswordUseCase,
    private readonly socialLogin: SocialLoginUseCase,
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for login/registration' })
  async request(@Body() dto: RequestOtpDto, @Req() req: Request) {
    const result = await this.requestOtp.execute({
      countryCode: dto.countryCode,
      phone: dto.phone,
      purpose: dto.purpose,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true, data: result };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and issue tokens' })
  async verify(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    const result = await this.verifyOtp.execute({
      countryCode: dto.countryCode,
      phone: dto.phone,
      code: dto.code,
      deviceId: dto.deviceId,
      fullName: dto.fullName,
      preferredLanguage: dto.preferredLanguage,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true, data: result };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create an account with email, password, and mobile' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const result = await this.registerAccount.execute({
      email: dto.email,
      password: dto.password,
      countryCode: dto.countryCode,
      phone: dto.phone,
      fullName: dto.fullName,
      preferredLanguage: dto.preferredLanguage,
      deviceId: dto.deviceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true, data: result };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.loginWithPassword.execute({
      email: dto.email,
      password: dto.password,
      preferredLanguage: dto.preferredLanguage,
      deviceId: dto.deviceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true, data: result };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('social')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Continue with Google or Apple and issue tokens',
  })
  async social(@Body() dto: SocialLoginDto, @Req() req: Request) {
    const result = await this.socialLogin.execute({
      provider: dto.provider as SocialProvider,
      subject: dto.subject,
      idToken: dto.idToken,
      email: dto.email,
      fullName: dto.fullName,
      preferredLanguage: dto.preferredLanguage,
      deviceId: dto.deviceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true, data: result };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const tokens = await this.tokens.rotateRefreshToken({
      refreshToken: dto.refreshToken,
      deviceId: dto.deviceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true, data: { tokens } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogoutDto,
  ) {
    if (dto.refreshToken) {
      await this.tokens.revokeRefreshToken(dto.refreshToken);
    }
    const ttl = this.config.getOrThrow<number>('jwt.accessTtlSeconds');
    await this.tokens.denylistAccessJti(user.jti, ttl);
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGOUT',
        resource: 'auth',
        metadata: {},
      },
    });
    return { success: true, data: { loggedOut: true } };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Current authenticated user' })
  async me(@CurrentUser() authUser: AuthenticatedUser) {
    return { success: true, data: await this.publicUser(authUser.id) };
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  async updateMe(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: UpdateMeDto,
  ) {
    if (dto.email) {
      const taken = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: authUser.id } },
        select: { id: true },
      });
      if (taken) {
        throw new ConflictException('Email is already in use');
      }
    }

    let phoneUpdate: {
      phoneE164: string;
      countryCode: string;
      phoneNational: string;
    } | null = null;
    if (dto.phone?.trim()) {
      let normalized;
      try {
        normalized = parseMobileInput(dto.phone.trim());
      } catch (err) {
        throw new BadRequestException(
          err instanceof Error
            ? err.message
            : 'Enter a valid Indian mobile number',
        );
      }
      const taken = await this.prisma.user.findFirst({
        where: {
          phoneE164: normalized.phoneE164,
          NOT: { id: authUser.id },
        },
        select: { id: true },
      });
      if (taken) {
        throw new ConflictException('This mobile number is already in use');
      }
      phoneUpdate = normalized;
    }

    await this.prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.email !== undefined
          ? { email: dto.email.trim().toLowerCase() }
          : {}),
        ...(phoneUpdate
          ? {
              phoneE164: phoneUpdate.phoneE164,
              countryCode: phoneUpdate.countryCode,
              phoneNational: phoneUpdate.phoneNational,
            }
          : {}),
        ...(dto.preferredLanguage
          ? { preferredLanguage: dto.preferredLanguage }
          : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      },
    });
    return { success: true, data: await this.publicUser(authUser.id) };
  }

  @Post('change-password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change or set my password' })
  async updatePassword(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const data = await this.changePassword.execute({
      userId: authUser.id,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    return { success: true, data };
  }

  private async publicUser(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        phoneE164: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        preferredLanguage: true,
        timezone: true,
        lastLoginAt: true,
        createdAt: true,
        passwordHash: true,
      },
    });
    const { passwordHash, ...safe } = user;
    return { ...safe, hasPassword: Boolean(passwordHash) };
  }
}
