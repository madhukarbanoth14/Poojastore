import { createHash } from 'crypto';
import { SocialProvider } from '@prisma/client';

/** Mirrors SocialLoginUseCase.allocateSocialPhone hashing for unit checks. */
export function socialPhoneNational(
  provider: SocialProvider,
  subject: string,
  attempt = 0,
): string {
  const digest = createHash('sha256')
    .update(`${provider}:${subject}:${attempt}`)
    .digest('hex');
  const digits = BigInt(`0x${digest}`).toString().replace(/\D/g, '');
  return `5${digits.padStart(9, '0').slice(0, 9)}`;
}
