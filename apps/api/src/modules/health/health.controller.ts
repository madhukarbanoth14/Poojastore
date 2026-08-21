import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../core/database/prisma.service';
import { RedisService } from '../../core/redis/redis.service';

const startedAt = Date.now();

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get('live')
  live() {
    return { success: true, data: { status: 'ok' } };
  }

  @Public()
  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const pong = await this.redis.ping();
      if (pong !== 'PONG') {
        throw new Error('Redis ping failed');
      }
      return {
        success: true,
        data: { status: 'ready', database: 'up', redis: 'up' },
      };
    } catch {
      throw new ServiceUnavailableException('Dependencies not ready');
    }
  }

  @Public()
  @Get('metrics')
  async metrics() {
    const [orders, payments, priestBookings, packageBookings, users] =
      await Promise.all([
        this.prisma.order.groupBy({ by: ['status'], _count: true }),
        this.prisma.payment.groupBy({ by: ['status'], _count: true }),
        this.prisma.priestBooking.groupBy({ by: ['status'], _count: true }),
        this.prisma.packageBooking.groupBy({ by: ['status'], _count: true }),
        this.prisma.user.count(),
      ]);

    return {
      success: true,
      data: {
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        process: {
          memoryRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
          nodeVersion: process.version,
        },
        counts: {
          users,
          orders: Object.fromEntries(
            orders.map((row) => [row.status, row._count]),
          ),
          payments: Object.fromEntries(
            payments.map((row) => [row.status, row._count]),
          ),
          priestBookings: Object.fromEntries(
            priestBookings.map((row) => [row.status, row._count]),
          ),
          packageBookings: Object.fromEntries(
            packageBookings.map((row) => [row.status, row._count]),
          ),
        },
      },
    };
  }
}
