import {
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
import { SocialLoginUseCase } from '../application/use-cases/social-login.use-case';
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
import { UpdateMeDto } from './dto/update-me.dto';
import { SocialProvider } from '@prisma/client';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly requestOtp: RequestOtpUseCase,
    private readonly verifyOtp: VerifyOtpUseCase,
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
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: authUser.id },
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
      },
    });
    return { success: true, data: user };
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
    const user = await this.prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.email !== undefined
          ? { email: dto.email.trim().toLowerCase() }
          : {}),
        ...(dto.preferredLanguage
          ? { preferredLanguage: dto.preferredLanguage }
          : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      },
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
      },
    });
    return { success: true, data: user };
  }
}
