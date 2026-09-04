import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  SMS_SENDER,
  type SmsSenderPort,
} from '../../auth/application/ports/sms-sender.port';
import { InvalidPhoneError, normalizePhone } from '../../auth/domain/phone';

function shopLink(raw?: string) {
  if (!raw) return 'https://pavitraseva.in/kits';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'https://pavitraseva.in/kits';
    }
    return url.toString();
  } catch {
    return 'https://pavitraseva.in/kits';
  }
}

@Injectable()
export class ReferKitService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SMS_SENDER) private readonly sms: SmsSenderPort,
  ) {}

  async refer(params: {
    userId: string;
    recipientName: string;
    recipientPhone: string;
    kitName: string;
    shopUrl?: string;
  }) {
    const digits = params.recipientPhone.replace(/\D/g, '');
    const countryCode =
      digits.length === 11 && digits.startsWith('1') ? '1' : '91';
    const national = digits.slice(-10);
    let phone;
    try {
      phone = normalizePhone(countryCode, national);
    } catch (error) {
      if (error instanceof InvalidPhoneError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const name = params.recipientName.trim();
    if (!name) throw new BadRequestException('Recipient name is required');
    const kit = params.kitName.trim() || 'a Pooja kit';
    const link = shopLink(params.shopUrl);

    await this.sms.sendMessage(
      phone.phoneE164,
      `Namaste ${name}, a family member recommended ${kit} on Pavitra Seva. View kits: ${link}`,
    );

    await this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: 'KIT_REFERRED',
        resource: 'order',
        metadata: {
          recipientName: name,
          recipientPhone: phone.phoneE164,
          kitName: kit,
        },
      },
    });

    return { sent: true };
  }
}
