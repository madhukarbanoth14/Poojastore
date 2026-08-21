import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../core/database/prisma.service';
import { RedisService } from '../../../../core/redis/redis.service';
import {
  generateNumericOtp,
  InvalidPhoneError,
  normalizePhone,
} from '../../domain/phone';
import { SMS_SENDER } from '../ports/sms-sender.port';
import type { SmsSenderPort } from '../ports/sms-sender.port';

export interface RequestOtpInput {
  countryCode: string;
  phone: string;
  purpose?: OtpPurpose;
  ipAddress?: string;
  userAgent?: string;
}

export interface RequestOtpResult {
  phoneE164: string;
  expiresInSeconds: number;
  /** Present only when OTP_RETURN_IN_RESPONSE=true (local/dev). */
  debugOtp?: string;
}

@Injectable()
export class RequestOtpUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    @Inject(SMS_SENDER) private readonly smsSender: SmsSenderPort, // port interface
  ) {}

  async execute(input: RequestOtpInput): Promise<RequestOtpResult> {
    let normalized;
    try {
      normalized = normalizePhone(input.countryCode, input.phone);
    } catch (error) {
      if (error instanceof InvalidPhoneError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const maxRequests = this.config.getOrThrow<number>(
      'otp.maxRequestsPerHour',
    );
    const rateKey = `otp:req:${normalized.phoneE164}`;
    const count = await this.redis.incrWithTtl(rateKey, 3600);
    if (count > maxRequests) {
      throw new HttpException(
        'Too many OTP requests. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (input.ipAddress) {
      const ipKey = `otp:ip:${input.ipAddress}`;
      const ipCount = await this.redis.incrWithTtl(ipKey, 3600);
      const ipMax = maxRequests * 3;
      if (ipCount > ipMax) {
        throw new HttpException(
          'Too many OTP requests from this network. Try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { phoneE164: normalized.phoneE164 },
    });
    if (existingUser?.status === 'SUSPENDED') {
      throw new BadRequestException('This account is suspended.');
    }
    if (existingUser?.status === 'DELETED') {
      throw new BadRequestException('This account is no longer available.');
    }

    const ttlSeconds = this.config.getOrThrow<number>('otp.ttlSeconds');
    const length = this.config.getOrThrow<number>('otp.length');
    const maxAttempts = this.config.getOrThrow<number>('otp.maxAttempts');
    const code = generateNumericOtp(length);
    const codeHash = await bcrypt.hash(code, 10);
    const purpose =
      input.purpose ??
      (existingUser ? OtpPurpose.LOGIN : OtpPurpose.REGISTRATION);

    await this.prisma.otpChallenge.create({
      data: {
        userId: existingUser?.id,
        phoneE164: normalized.phoneE164,
        purpose,
        codeHash,
        maxAttempts,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    await this.smsSender.sendOtp(normalized.phoneE164, code);

    await this.prisma.auditLog.create({
      data: {
        userId: existingUser?.id,
        action: 'OTP_REQUESTED',
        resource: 'auth',
        metadata: {
          phoneE164: normalized.phoneE164,
          purpose,
        },
        ipAddress: input.ipAddress,
      },
    });

    const result: RequestOtpResult = {
      phoneE164: normalized.phoneE164,
      expiresInSeconds: ttlSeconds,
    };

    if (this.config.get<boolean>('otp.returnInResponse')) {
      result.debugOtp = code;
    }

    return result;
  }
}
