import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, UserStatus } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import { AuthenticatedUser } from '../domain/authenticated-user';
import { PrismaService } from '../../../core/database/prisma.service';
import { RedisService } from '../../../core/redis/redis.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
  tokenType: 'Bearer';
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async issueTokens(params: {
    userId: string;
    phoneE164: string;
    role: Role;
    status: UserStatus;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    familyId?: string;
  }): Promise<TokenPair> {
    const accessTtl = this.config.getOrThrow<number>('jwt.accessTtlSeconds');
    const refreshTtl = this.config.getOrThrow<number>('jwt.refreshTtlSeconds');
    const jti = randomUUID();
    const familyId = params.familyId ?? randomUUID();

    const accessToken = await this.jwt.signAsync(
      {
        sub: params.userId,
        phone: params.phoneE164,
        role: params.role,
        status: params.status,
        jti,
      },
      {
        secret: this.config.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: accessTtl,
      },
    );

    const refreshToken = `${randomUUID()}${randomUUID()}`;
    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash,
        familyId,
        deviceId: params.deviceId,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: accessTtl,
      refreshExpiresIn: refreshTtl,
      tokenType: 'Bearer',
    };
  }

  async rotateRefreshToken(params: {
    refreshToken: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<TokenPair> {
    const tokenHash = this.hashToken(params.refreshToken);
    const matched = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });

    if (!matched) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (matched.revokedAt || matched.expiresAt <= new Date()) {
      // Possible reuse of a rotated token — revoke the entire family.
      await this.prisma.refreshToken.updateMany({
        where: { familyId: matched.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (
      matched.user.status === UserStatus.SUSPENDED ||
      matched.user.status === UserStatus.DELETED
    ) {
      throw new UnauthorizedException('Account is not active');
    }

    await this.prisma.refreshToken.update({
      where: { id: matched.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens({
      userId: matched.user.id,
      phoneE164: matched.user.phoneE164,
      role: matched.user.role,
      status: matched.user.status,
      deviceId: params.deviceId ?? matched.deviceId ?? undefined,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      familyId: matched.familyId,
    });
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async denylistAccessJti(jti: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`auth:denylist:${jti}`, '1', ttlSeconds);
  }

  async isAccessDenylisted(jti: string): Promise<boolean> {
    const value = await this.redis.get(`auth:denylist:${jti}`);
    return value === '1';
  }

  toAuthenticatedUser(payload: {
    sub: string;
    phone: string;
    role: Role;
    status: UserStatus;
    jti: string;
  }): AuthenticatedUser {
    return {
      id: payload.sub,
      phoneE164: payload.phone,
      role: payload.role,
      status: payload.status,
      jti: payload.jti,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
