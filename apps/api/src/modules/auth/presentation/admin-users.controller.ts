import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../domain/authenticated-user';
import { PrismaService } from '../../../core/database/prisma.service';

class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}

@ApiTags('Admin Users')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller({ path: 'admin/users', version: '1' })
export class AdminUsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List users (admin)' })
  async list(@Query() query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();
    const name = query.name?.trim();
    const phoneDigits = query.phone?.replace(/\D/g, '') ?? '';
    const where = {
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(name
        ? { fullName: { contains: name, mode: 'insensitive' as const } }
        : {}),
      ...(phoneDigits
        ? {
            OR: [
              { phoneE164: { contains: phoneDigits } },
              { phoneNational: { contains: phoneDigits } },
            ],
          }
        : {}),
      ...(search && !name && !phoneDigits
        ? {
            OR: [
              { phoneE164: { contains: search } },
              { phoneNational: { contains: search.replace(/\D/g, '') || search } },
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          phoneE164: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          market: true,
          preferredLanguage: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { orders: true } },
          addresses: {
            where: { isDefault: true },
            take: 1,
            select: { city: true, state: true },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        items: items.map(({ addresses, _count, ...user }) => ({
          ...user,
          orderCount: _count.orders,
          city: addresses[0]?.city ?? null,
          state: addresses[0]?.state ?? null,
        })),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status (admin)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        phoneE164: true,
        role: true,
        status: true,
        fullName: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'USER_STATUS_UPDATED',
        resource: 'user',
        metadata: { targetUserId: id, status: dto.status },
      },
    });

    return { success: true, data: user };
  }
}
