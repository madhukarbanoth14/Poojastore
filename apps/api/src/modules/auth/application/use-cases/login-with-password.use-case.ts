import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../core/database/prisma.service';
import { TokenPair, TokenService } from '../../infrastructure/token.service';

export interface LoginWithPasswordInput {
  email: string;
  password: string;
  preferredLanguage?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginWithPasswordResult {
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
export class LoginWithPasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginWithPasswordInput): Promise<LoginWithPasswordResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google or Apple. Sign in with that option, or create an email account.',
      );
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        preferredLanguage:
          input.preferredLanguage?.trim() || user.preferredLanguage,
      },
    });

    const tokens = await this.tokens.issueTokens({
      userId: updated.id,
      phoneE164: updated.phoneE164,
      role: updated.role,
      status: updated.status,
      deviceId: input.deviceId,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    await this.prisma.auditLog.create({
      data: {
        userId: updated.id,
        action: 'USER_LOGIN',
        resource: 'auth',
        metadata: { email, method: 'password' },
        ipAddress: input.ipAddress,
      },
    });

    return {
      tokens,
      user: {
        id: updated.id,
        phoneE164: updated.phoneE164,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        status: updated.status,
        preferredLanguage: updated.preferredLanguage,
        isNewUser: false,
      },
    };
  }
}
