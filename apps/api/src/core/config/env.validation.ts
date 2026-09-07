import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV!: string;

  @IsInt()
  @Min(1)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET!: string;

  @IsInt()
  @Min(60)
  JWT_ACCESS_TTL_SECONDS!: number;

  @IsInt()
  @Min(3600)
  JWT_REFRESH_TTL_SECONDS!: number;

  @IsInt()
  @Min(4)
  OTP_LENGTH!: number;

  @IsInt()
  @Min(60)
  OTP_TTL_SECONDS!: number;

  @IsInt()
  @Min(1)
  OTP_MAX_ATTEMPTS!: number;

  @IsInt()
  @Min(1)
  OTP_MAX_REQUESTS_PER_HOUR!: number;

  @IsBooleanString()
  @IsOptional()
  OTP_RETURN_IN_RESPONSE?: string;

  @IsIn(['console', 'twilio'])
  SMS_PROVIDER!: string;

  @IsString()
  @IsOptional()
  TWILIO_ACCOUNT_SID?: string;

  @IsString()
  @IsOptional()
  TWILIO_AUTH_TOKEN?: string;

  @IsString()
  @IsOptional()
  TWILIO_FROM_NUMBER?: string;

  @IsString()
  @IsOptional()
  TWILIO_MESSAGING_SERVICE_SID?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsBooleanString()
  @IsOptional()
  SWAGGER_ENABLED?: string;

  @IsIn(['mock', 'live'])
  @IsOptional()
  PAYMENT_MODE?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_KEY_ID?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_KEY_SECRET?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  STRIPE_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  STRIPE_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  UPI_VPA?: string;

  @IsString()
  @IsOptional()
  UPI_PAYEE_NAME?: string;

  @IsString()
  @IsOptional()
  UPI_QR_IMAGE_URL?: string;

  @IsString()
  @IsOptional()
  VENDOR_NAME?: string;

  @IsString()
  @IsOptional()
  VENDOR_PHONE_E164?: string;
}

function assertTwilioConfigured(env: EnvironmentVariables) {
  if (env.SMS_PROVIDER !== 'twilio') return;
  const failures: string[] = [];
  if (!env.TWILIO_ACCOUNT_SID) failures.push('TWILIO_ACCOUNT_SID is required');
  if (!env.TWILIO_AUTH_TOKEN) failures.push('TWILIO_AUTH_TOKEN is required');
  if (!env.TWILIO_FROM_NUMBER && !env.TWILIO_MESSAGING_SERVICE_SID) {
    failures.push(
      'TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID is required',
    );
  }
  if (failures.length) {
    throw new Error(`Twilio config rejected:\n- ${failures.join('\n- ')}`);
  }
}

function assertLivePaymentsConfigured(env: EnvironmentVariables) {
  if ((env.PAYMENT_MODE ?? 'mock') !== 'live' && env.NODE_ENV !== 'production') {
    return;
  }
  if ((env.PAYMENT_MODE ?? 'mock') !== 'live') return;

  const failures: string[] = [];
  const hasRazorpayKeys =
    !!env.RAZORPAY_KEY_ID && !!env.RAZORPAY_KEY_SECRET;
  const hasRazorpay =
    hasRazorpayKeys &&
    (env.NODE_ENV === 'production' ? !!env.RAZORPAY_WEBHOOK_SECRET : true);
  const hasStripe = !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET;
  const hasUpi = !!env.UPI_VPA || !!env.UPI_QR_IMAGE_URL;
  if (!hasRazorpay && !hasStripe && !hasUpi) {
    failures.push(
      'PAYMENT_MODE=live requires Razorpay, Stripe, or a company UPI QR (UPI_VPA / UPI_QR_IMAGE_URL)',
    );
  }
  if (failures.length) {
    throw new Error(`Live payment config rejected:\n- ${failures.join('\n- ')}`);
  }
}

function assertProductionSafety(env: EnvironmentVariables) {
  if (env.NODE_ENV !== 'production') return;

  const failures: string[] = [];

  if ((env.PAYMENT_MODE ?? 'mock') !== 'live') {
    failures.push('PAYMENT_MODE must be "live" in production');
  }
  if (env.SMS_PROVIDER === 'console') {
    failures.push('SMS_PROVIDER must not be "console" in production');
  }
  if (env.OTP_RETURN_IN_RESPONSE === 'true') {
    failures.push('OTP_RETURN_IN_RESPONSE must be false in production');
  }
  if (env.SWAGGER_ENABLED === 'true') {
    failures.push('SWAGGER_ENABLED must be false in production');
  }
  if (
    env.JWT_ACCESS_SECRET.includes('change-me') ||
    env.JWT_REFRESH_SECRET.includes('change-me')
  ) {
    failures.push('JWT secrets must be replaced before production');
  }

  if (failures.length) {
    throw new Error(
      `Production config rejected:\n- ${failures.join('\n- ')}`,
    );
  }
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  assertProductionSafety(validated);
  assertTwilioConfigured(validated);
  assertLivePaymentsConfigured(validated);
  // Return the original env map so Razorpay/Stripe keys stay available to
  // ConfigModule (class instances omit keys that were not enumerated).
  return config;
}
