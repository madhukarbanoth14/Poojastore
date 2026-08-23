import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Market, Role, SocialProvider, UserStatus } from '@prisma/client';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaService } from '../../../../core/database/prisma.service';
import { socialPhoneNational } from '../../domain/social-phone';
import { TokenPair, TokenService } from '../../infrastructure/token.service';

export interface SocialLoginInput {
  provider: SocialProvider;
  /** Stable provider subject (sub). Required when idToken is omitted in non-prod. */
  subject?: string;
  idToken?: string;
  email?: string;
  fullName?: string;
  preferredLanguage?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SocialLoginResult {
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

const GOOGLE_ISSUERS = new Set([
  'https://accounts.google.com',
  'accounts.google.com',
]);
const APPLE_ISSUER = 'https://appleid.apple.com';

@Injectable()
export class SocialLoginUseCase {
  private readonly googleJwks = createRemoteJWKSet(
    new URL('https://www.googleapis.com/oauth2/v3/certs'),
  );
  private readonly appleJwks = createRemoteJWKSet(
    new URL('https://appleid.apple.com/auth/keys'),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: SocialLoginInput): Promise<SocialLoginResult> {
    const nodeEnv = this.config.get<string>('nodeEnv') ?? 'development';
    const requireIdToken =
      nodeEnv === 'production' ||
      this.config.get<boolean>('social.requireIdToken') === true;

    let subject = input.subject?.trim() || '';
    let email = input.email?.trim().toLowerCase() || null;
    let fullName = input.fullName?.trim() || null;

    if (input.idToken?.trim()) {
      const verified = await this.verifyIdToken(
        input.provider,
        input.idToken.trim(),
      );
      subject = verified.subject;
      email = verified.email ?? email;
      fullName = verified.fullName ?? fullName;
    } else if (requireIdToken) {
      throw new UnauthorizedException(
        'A valid Google or Apple ID token is required',
      );
    }

    if (!subject) {
      throw new BadRequestException('Social subject is required');
    }

    const existing = await this.prisma.socialIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: input.provider,
          providerUserId: subject,
        },
      },
      include: { user: true },
    });

    let isNewUser = false;
    let user = existing?.user ?? null;

    if (user) {
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Account is not active');
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          email: email ?? user.email,
          fullName: fullName ?? user.fullName,
          preferredLanguage:
            input.preferredLanguage?.trim() || user.preferredLanguage,
        },
      });
      if (email && existing && existing.email !== email) {
        await this.prisma.socialIdentity.update({
          where: { id: existing.id },
          data: { email },
        });
      }
    } else {
      isNewUser = true;
      if (email) {
        const byEmail = await this.prisma.user.findUnique({ where: { email } });
        if (byEmail) {
          if (byEmail.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('Account is not active');
          }
          user = await this.prisma.user.update({
            where: { id: byEmail.id },
            data: {
              lastLoginAt: new Date(),
              fullName: fullName ?? byEmail.fullName,
              preferredLanguage:
                input.preferredLanguage?.trim() || byEmail.preferredLanguage,
            },
          });
          await this.prisma.socialIdentity.create({
            data: {
              userId: user.id,
              provider: input.provider,
              providerUserId: subject,
              email,
            },
          });
        }
      }

      if (!user) {
        const phone = await this.allocateSocialPhone(
          input.provider,
          subject,
        );
        user = await this.prisma.user.create({
          data: {
            phoneE164: phone.phoneE164,
            countryCode: phone.countryCode,
            phoneNational: phone.phoneNational,
            email,
            fullName,
            preferredLanguage: input.preferredLanguage?.trim() || 'en',
            market: Market.IN,
            role: Role.CUSTOMER,
            status: UserStatus.ACTIVE,
            lastLoginAt: new Date(),
            socialIdentities: {
              create: {
                provider: input.provider,
                providerUserId: subject,
                email,
              },
            },
          },
        });
      }
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
        action: isNewUser ? 'USER_REGISTERED_SOCIAL' : 'USER_LOGIN_SOCIAL',
        resource: 'auth',
        metadata: {
          provider: input.provider,
          subject,
          email,
        },
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
        isNewUser,
      },
    };
  }

  private async verifyIdToken(
    provider: SocialProvider,
    idToken: string,
  ): Promise<{ subject: string; email: string | null; fullName: string | null }> {
    if (provider === SocialProvider.GOOGLE) {
      const audiences = (
        this.config.get<string>('social.googleClientIds') ?? ''
      )
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      if (!audiences.length) {
        throw new UnauthorizedException(
          'GOOGLE_CLIENT_IDS is not configured for ID token verification',
        );
      }
      const { payload } = await jwtVerify(idToken, this.googleJwks, {
        audience: audiences,
      });
      if (!payload.sub || !GOOGLE_ISSUERS.has(String(payload.iss))) {
        throw new UnauthorizedException('Invalid Google ID token');
      }
      return {
        subject: String(payload.sub),
        email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null,
        fullName: typeof payload.name === 'string' ? payload.name : null,
      };
    }

    const appleAudience = this.config.get<string>('social.appleClientId') ?? '';
    if (!appleAudience) {
      throw new UnauthorizedException(
        'APPLE_CLIENT_ID is not configured for ID token verification',
      );
    }
    const { payload } = await jwtVerify(idToken, this.appleJwks, {
      audience: appleAudience,
      issuer: APPLE_ISSUER,
    });
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid Apple ID token');
    }
    return {
      subject: String(payload.sub),
      email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null,
      fullName: null,
    };
  }

  /** Placeholder E.164 unique to provider+subject (OTP phones stay in real ranges). */
  private async allocateSocialPhone(
    provider: SocialProvider,
    subject: string,
  ): Promise<{
    countryCode: string;
    phoneNational: string;
    phoneE164: string;
  }> {
    const countryCode = '91';
    for (let i = 0; i < 8; i += 1) {
      const phoneNational = socialPhoneNational(provider, subject, i);
      const phoneE164 = `+${countryCode}${phoneNational}`;
      const taken = await this.prisma.user.findUnique({
        where: { phoneE164 },
        select: { id: true },
      });
      if (!taken) {
        return { countryCode, phoneNational, phoneE164 };
      }
    }
    throw new BadRequestException('Unable to allocate social account');
  }
}
