import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Market, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../core/database/prisma.service';
import {
  InvalidPhoneError,
  normalizePhone,
} from '../../domain/phone';
import { TokenPair, TokenService } from '../../infrastructure/token.service';

export interface VerifyOtpInput {
  countryCode: string;
  phone: string;
  code: string;
  deviceId?: string;
  fullName?: string;
  preferredLanguage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface VerifyOtpResult {
  tokens: TokenPair;
  user: {
    id: string;
    phoneE164: string;
    fullName: string | null;
    role: Role;
    status: UserStatus;
    preferredLanguage: string;
    isNewUser: boolean;
  };
}

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpResult> {
    let normalized;
    try {
      normalized = normalizePhone(input.countryCode, input.phone);
    } catch (error) {
      if (error instanceof InvalidPhoneError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        phoneE164: normalized.phoneE164,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new UnauthorizedException('OTP expired or not found. Request a new one.');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new UnauthorizedException('Too many invalid OTP attempts.');
    }

    const valid = await bcrypt.compare(input.code, challenge.codeHash);
    if (!valid) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid OTP code.');
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    let isNewUser = false;
    let user = await this.prisma.user.findUnique({
      where: { phoneE164: normalized.phoneE164 },
    });

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          phoneE164: normalized.phoneE164,
          countryCode: normalized.countryCode,
          phoneNational: normalized.phoneNational,
          fullName: input.fullName?.trim() || null,
          preferredLanguage: input.preferredLanguage?.trim() || 'en',
          market: normalized.countryCode === '1' ? Market.US : Market.IN,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          lastLoginAt: new Date(),
        },
      });
    } else {
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Account is not active');
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          fullName: input.fullName?.trim() || user.fullName,
          preferredLanguage:
            input.preferredLanguage?.trim() || user.preferredLanguage,
        },
      });
    }

    const tokens = await this.tokens.issueTokens({
      userId: user.id,
      phoneE164: user.phoneE164,
      role: user.role,
      status: user.status,
      deviceId: input.deviceId,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: isNewUser ? 'USER_REGISTERED' : 'USER_LOGIN',
        resource: 'auth',
        metadata: { phoneE164: user.phoneE164 },
        ipAddress: input.ipAddress,
      },
    });

    return {
      tokens,
      user: {
        id: user.id,
        phoneE164: user.phoneE164,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        preferredLanguage: user.preferredLanguage,
        isNewUser,
      },
    };
  }
}
