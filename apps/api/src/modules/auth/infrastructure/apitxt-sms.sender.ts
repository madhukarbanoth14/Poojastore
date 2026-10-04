import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsSenderPort } from '../application/ports/sms-sender.port';

/** ApiTxt (apitxt.com) transactional SMS for India DLT. */
@Injectable()
export class ApiTxtSmsSender implements SmsSenderPort {
  private readonly logger = new Logger(ApiTxtSmsSender.name);
  private readonly endpoint: string;
  private readonly authKey: string;
  private readonly sender: string;
  private readonly route: string;
  private readonly unicode: string;
  private readonly peId: string;
  private readonly templateId: string;
  private readonly otpTemplateId: string;
  private readonly otpMessageTemplate: string;
  private readonly countryFallback: string;

  constructor(private readonly config: ConfigService) {
    this.endpoint =
      this.config.get<string>('apitxt.endpoint') ??
      'https://www.apitxt.com/api/sendMsg';
    this.authKey = this.config.get<string>('apitxt.authKey') ?? '';
    this.sender = this.config.get<string>('apitxt.sender') ?? '';
    this.route = this.config.get<string>('apitxt.route') ?? '4';
    this.unicode = this.config.get<string>('apitxt.unicode') ?? '0';
    this.peId = this.config.get<string>('apitxt.peId') ?? '';
    this.templateId = this.config.get<string>('apitxt.templateId') ?? '';
    this.otpTemplateId =
      this.config.get<string>('apitxt.otpTemplateId') || this.templateId;
    this.otpMessageTemplate =
      this.config.get<string>('apitxt.otpMessageTemplate') ??
      'Pavitra Seva OTP: {otp}. Valid for a few minutes. Do not share.';
    this.countryFallback = this.config.get<string>('apitxt.country') ?? '91';
  }

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    const message = this.otpMessageTemplate
      .replaceAll('{otp}', code)
      .replaceAll('{#var#}', code);
    await this.dispatch(phoneE164, message, this.otpTemplateId);
  }

  async sendMessage(phoneE164: string, body: string): Promise<void> {
    await this.dispatch(phoneE164, body, this.templateId);
  }

  private async dispatch(
    phoneE164: string,
    message: string,
    templateId: string,
  ): Promise<void> {
    if (!this.authKey) {
      throw new Error('ApiTxt is not configured (APITXT_AUTH_KEY)');
    }
    if (!this.sender) {
      throw new Error('ApiTxt requires APITXT_SENDER (6-letter DLT header)');
    }
    if (!this.peId) {
      throw new Error('ApiTxt requires APITXT_PE_ID (DLT Principal Entity Id)');
    }
    if (!templateId) {
      throw new Error(
        'ApiTxt requires APITXT_TEMPLATE_ID (or APITXT_OTP_TEMPLATE_ID for OTP)',
      );
    }

    const { mobiles, country } = toApiTxtMobile(phoneE164, this.countryFallback);
    const params = new URLSearchParams({
      authkey: this.authKey,
      mobiles,
      message,
      sender: this.sender,
      route: this.route,
      unicode: this.unicode,
      pe_id: this.peId,
      template_id: templateId,
      country,
    });

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const raw = (await response.text()).trim();
    const parsed = parseApiTxtResponse(raw);

    if (!response.ok || parsed.failed) {
      this.logger.error(
        `ApiTxt SMS failed to=${phoneE164} status=${response.status} body=${raw}`,
      );
      throw new Error(
        parsed.message
          ? `ApiTxt SMS failed: ${parsed.message}`
          : `ApiTxt SMS failed (${response.status})`,
      );
    }

    this.logger.log(
      `ApiTxt SMS queued to=${phoneE164} ref=${parsed.ref ?? 'ok'}`,
    );
  }
}

/** Convert E.164 to ApiTxt mobiles + country (India-first; 10-digit national). */
export function toApiTxtMobile(
  phoneE164: string,
  countryFallback = '91',
): { mobiles: string; country: string } {
  const digits = phoneE164.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return { mobiles: digits.slice(2), country: '91' };
  }
  if (digits.startsWith('1') && digits.length === 11) {
    return { mobiles: digits.slice(1), country: '1' };
  }
  if (digits.length === 10) {
    return { mobiles: digits, country: countryFallback };
  }
  return { mobiles: digits, country: countryFallback };
}

export function parseApiTxtResponse(raw: string): {
  failed: boolean;
  message?: string;
  ref?: string;
} {
  if (!raw) {
    return { failed: true, message: 'empty response' };
  }

  try {
    const json = JSON.parse(raw) as unknown;
    if (typeof json === 'number' || typeof json === 'string') {
      const code = String(json);
      if (/^(10[1-6]|11[123]|20[2-4]|30[1-7]|311)$/.test(code)) {
        return { failed: true, message: `error code ${code}` };
      }
      return { failed: false, ref: code };
    }
    if (!json || typeof json !== 'object') {
      return { failed: false, ref: raw };
    }
    const obj = json as Record<string, unknown>;
    const status = String(obj.status ?? obj.type ?? '').toUpperCase();
    const message = String(obj.message ?? obj.msg ?? obj.description ?? '');
    const code = String(obj.code ?? obj.error_code ?? '');

    const failedStatuses = new Set([
      'ERROR',
      'FAILED',
      'AUTH_FAILED',
      'FAILURE',
    ]);
    if (failedStatuses.has(status) || /^[123]\d{2}$/.test(code)) {
      return {
        failed: true,
        message: message || status || code || raw,
      };
    }

    const ref = String(
      obj.request_id ?? obj.requestId ?? obj.id ?? obj.message_id ?? '',
    );
    return { failed: false, ref: ref || undefined, message: message || undefined };
  } catch {
    // Numeric TRAI-style error codes from older ApiTxt responses.
    if (/^(10[1-6]|11[123]|20[2-4]|30[1-7]|311)$/.test(raw)) {
      return { failed: true, message: `error code ${raw}` };
    }
    if (/error|fail|invalid/i.test(raw)) {
      return { failed: true, message: raw };
    }
    return { failed: false, ref: raw };
  }
}
