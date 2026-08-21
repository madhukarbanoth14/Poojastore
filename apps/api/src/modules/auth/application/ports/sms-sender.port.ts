export const SMS_SENDER = Symbol('SMS_SENDER');

export abstract class SmsSenderPort {
  abstract sendOtp(phoneE164: string, code: string): Promise<void>;
}
