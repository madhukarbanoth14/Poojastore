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
  search?: string;

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
    const where = {
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { phoneE164: { contains: query.search } },
              { fullName: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
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
          preferredLanguage: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        items,
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
