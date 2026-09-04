import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Market, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../core/database/prisma.service';
import { InvalidPhoneError, normalizePhone } from '../../domain/phone';
import { TokenPair, TokenService } from '../../infrastructure/token.service';

export interface RegisterAccountInput {
  email: string;
  password: string;
  countryCode: string;
  phone: string;
  fullName?: string;
  preferredLanguage?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordAuthResult {
  tokens: TokenPair;
  user: {
    id: string;
    phoneE164: string;
    email: string | null;
    fullName: string | null;
    role: Role;
    status: UserStatus;
    preferredLanguage: string;
    isNewUser: boolean;
  };
}

@Injectable()
export class RegisterAccountUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: RegisterAccountInput): Promise<PasswordAuthResult> {
    const email = input.email.trim().toLowerCase();
    let normalized;
    try {
      normalized = normalizePhone(input.countryCode, input.phone);
    } catch (error) {
      if (error instanceof InvalidPhoneError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const [emailTaken, phoneTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email }, select: { id: true } }),
      this.prisma.user.findUnique({
        where: { phoneE164: normalized.phoneE164 },
        select: { id: true },
      }),
    ]);
    if (emailTaken) {
      throw new ConflictException('An account with this email already exists');
    }
    if (phoneTaken) {
      throw new ConflictException('An account with this mobile number already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
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
        action: 'USER_REGISTERED',
        resource: 'auth',
        metadata: { email, phoneE164: user.phoneE164, method: 'password' },
        ipAddress: input.ipAddress,
      },
    });

    return {
      tokens,
      user: {
        id: user.id,
        phoneE164: user.phoneE164,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        preferredLanguage: user.preferredLanguage,
        isNewUser: true,
      },
    };
  }
}
