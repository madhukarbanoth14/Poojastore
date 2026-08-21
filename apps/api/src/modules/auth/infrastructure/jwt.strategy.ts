import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserStatus } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../core/database/prisma.service';
import { AuthenticatedUser } from '../domain/authenticated-user';
import { TokenService } from './token.service';

interface JwtPayload {
  sub: string;
  phone: string;
  role: AuthenticatedUser['role'];
  status: UserStatus;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload?.sub || !payload?.jti) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (await this.tokens.isAccessDenylisted(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== UserStatus.ACTIVE || user.deletedAt) {
      throw new UnauthorizedException('Account is not active');
    }

    return this.tokens.toAuthenticatedUser({
      sub: user.id,
      phone: user.phoneE164,
      role: user.role,
      status: user.status,
      jti: payload.jti,
    });
  }
}
