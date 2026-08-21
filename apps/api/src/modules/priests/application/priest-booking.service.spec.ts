import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PriestBookingStatus } from '@prisma/client';
import { PriestBookingService } from './priest-booking.service';

describe('PriestBookingService.cancelBooking', () => {
  const slotId = 'slot-1';
  const bookingId = 'book-1';
  const userId = 'user-1';

  function makeService(booking: Record<string, unknown>) {
    const prisma = {
      priestBooking: {
        findUnique: jest.fn().mockResolvedValue(booking),
      },
      $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          priestSlot: {
            update: jest.fn().mockResolvedValue({}),
          },
          priestBooking: {
            update: jest.fn().mockResolvedValue({
              ...booking,
              status: PriestBookingStatus.CANCELLED,
            }),
          },
          order: {
            update: jest.fn().mockResolvedValue({}),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return fn(tx);
      }),
    };
    return {
      service: new PriestBookingService(
        prisma as never,
        {} as never,
        { createForBooking: jest.fn() } as never,
      ),
      prisma,
    };
  }

  it('rejects missing booking', async () => {
    const { service } = makeService(null as never);
    await expect(
      service.cancelBooking({
        bookingId,
        actorUserId: userId,
        isAdmin: false,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects cancel of package-linked priest booking', async () => {
    const { service } = makeService({
      id: bookingId,
      userId,
      status: PriestBookingStatus.CONFIRMED,
      slotId,
      packageBooking: { id: 'pkg-1' },
      slot: { startsAt: new Date(Date.now() + 86_400_000) },
    });
    await expect(
      service.cancelBooking({
        bookingId,
        actorUserId: userId,
        isAdmin: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cancels confirmed booking and suggests refund', async () => {
    const { service } = makeService({
      id: bookingId,
      userId,
      status: PriestBookingStatus.CONFIRMED,
      slotId,
      orderId: 'order-1',
      packageBooking: null,
      slot: { startsAt: new Date(Date.now() + 86_400_000) },
      order: { status: 'PAID' },
    });
    const result = await service.cancelBooking({
      bookingId,
      actorUserId: userId,
      isAdmin: false,
      reason: 'plans changed',
    });
    expect(result.refundSuggested).toBe(true);
    expect(result.booking.status).toBe(PriestBookingStatus.CANCELLED);
  });
});
