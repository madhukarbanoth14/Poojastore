import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Market, Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { TokenService } from '../../auth/infrastructure/token.service';
import {
  InvalidPhoneError,
  parseMobileInput,
} from '../../auth/domain/phone';
import { CartService } from '../../cart/application/cart.service';
import { CheckoutService } from './checkout.service';
import {
  HYDERABAD_DELIVERY_MESSAGE,
  isHyderabadDelivery,
} from '../domain/delivery-zone';

@Injectable()
export class GuestCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly cart: CartService,
    private readonly checkout: CheckoutService,
  ) {}

  async placeOrder(
    dto: {
      productId: string;
      selectedItemKeys?: string[];
      fullName: string;
      phone: string;
      email?: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      deliverySlot?: string;
    },
    meta?: { deviceId?: string; ipAddress?: string; userAgent?: string },
  ) {
    let phone;
    try {
      phone = parseMobileInput(dto.phone);
    } catch (error) {
      if (error instanceof InvalidPhoneError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const fullName = dto.fullName.trim();
    if (fullName.length < 2) {
      throw new BadRequestException('Enter your full name');
    }
    const line1 = dto.line1.trim();
    const city = dto.city.trim();
    const state = dto.state.trim();
    const postalCode = dto.postalCode.trim();
    if (!line1 || !city || !state || !postalCode) {
      throw new BadRequestException('Enter the full delivery address');
    }
    if (!isHyderabadDelivery({ city, postalCode })) {
      throw new BadRequestException(HYDERABAD_DELIVERY_MESSAGE);
    }

    const email = dto.email?.trim().toLowerCase() || null;
    if (email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, phoneE164: true },
      });
      if (emailTaken && emailTaken.phoneE164 !== phone.phoneE164) {
        throw new ConflictException(
          'This email already has an account. Sign in to continue.',
        );
      }
    }

    let created = false;
    let user = await this.prisma.user.findUnique({
      where: { phoneE164: phone.phoneE164 },
    });
    if (user) {
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Account is not active');
      }
      if (user.passwordHash || user.googleSub || user.appleSub) {
        throw new ConflictException(
          'This mobile already has an account. Sign in with Google in Chrome/Safari, or use email and password.',
        );
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: user.fullName || fullName,
          email: user.email || email,
          lastLoginAt: new Date(),
        },
      });
    } else {
      created = true;
      user = await this.prisma.user.create({
        data: {
          phoneE164: phone.phoneE164,
          countryCode: phone.countryCode,
          phoneNational: phone.phoneNational,
          fullName,
          email,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          market: phone.countryCode === '1' ? Market.US : Market.IN,
          lastLoginAt: new Date(),
        },
      });
    }

    const tokens = await this.tokens.issueTokens({
      userId: user.id,
      phoneE164: user.phoneE164,
      role: user.role,
      status: user.status,
      deviceId: meta?.deviceId,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    await this.prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
    const address = await this.prisma.address.create({
      data: {
        userId: user.id,
        label: 'Home',
        line1,
        line2: dto.line2?.trim() || null,
        city,
        state,
        postalCode,
        country: phone.countryCode === '1' ? 'US' : 'IN',
        isDefault: true,
      },
    });

    await this.cart.add(user.id, {
      productId: dto.productId,
      quantity: 1,
      selectedItemKeys: dto.selectedItemKeys,
      replace: true,
    });

    const order = await this.checkout.checkout(
      user.id,
      address.id,
      dto.deliverySlot?.trim() || 'Within 6 hours',
      { contactPhone: phone.phoneE164 },
    );

    if (created) {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          resource: 'auth',
          metadata: { phoneE164: user.phoneE164, method: 'guest-checkout' },
          ipAddress: meta?.ipAddress,
        },
      });
    }

    return {
      ...order,
      tokens,
      user: {
        id: user.id,
        phoneE164: user.phoneE164,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        preferredLanguage: user.preferredLanguage,
        hasPassword: Boolean(user.passwordHash),
        isNewUser: created,
      },
    };
  }
}
