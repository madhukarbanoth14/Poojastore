import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  EMAIL_SENDER,
  type EmailSenderPort,
} from './ports/email-sender.port';
import { formatOrderConfirmationEmail } from './order-confirmation-email';

@Injectable()
export class OrderConfirmationEmailService {
  private readonly logger = new Logger(OrderConfirmationEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(EMAIL_SENDER) private readonly email: EmailSenderPort,
  ) {}

  async sendForOrder(orderId: string): Promise<{ sent: boolean; reason?: string }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        user: { select: { email: true, fullName: true } },
      },
    });

    if (!order) {
      return { sent: false, reason: 'order_not_found' };
    }

    const to = order.user.email?.trim().toLowerCase();
    if (!to) {
      this.logger.log(
        `Skip order confirmation email for ${order.orderNumber}: no customer email`,
      );
      return { sent: false, reason: 'no_email' };
    }

    const content = formatOrderConfirmationEmail({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user.fullName,
      currency: order.currency,
      totalMinor: order.totalMinor,
      deliverySlot: order.deliverySlot,
      items: order.items,
      shippingAddress: order.shippingAddress,
      webBaseUrl: this.config.get<string>('email.webBaseUrl'),
    });

    await this.email.send({
      to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    this.logger.log(
      `Order confirmation email sent for ${order.orderNumber} to ${to}`,
    );
    return { sent: true };
  }
}
