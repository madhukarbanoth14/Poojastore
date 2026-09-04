import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PushPlatform } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import {
  DeviceTokenService,
  PushNotificationService,
} from '../application/push-notification.service';

class RegisterPushTokenDto {
  @IsString()
  @MaxLength(512)
  token!: string;

  @IsEnum(PushPlatform)
  platform!: PushPlatform;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  deviceId?: string;
}

class RemovePushTokenDto {
  @IsString()
  @MaxLength(512)
  token!: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notifications: PushNotificationService) {}

  @Get()
  @ApiOperation({ summary: 'In-app notification feed' })
  async list(@CurrentUser() user: AuthenticatedUser) {
    const items = await this.notifications.listForUser(user.id);
    const unreadCount = await this.notifications.unreadCount(user.id);
    return { success: true, data: { items, unreadCount } };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.notifications.markAllRead(user.id);
    return { success: true, data };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.notifications.markRead(user.id, id);
    return { success: true, data };
  }
}

@ApiTags('Devices')
@ApiBearerAuth()
@Controller({ path: 'devices', version: '1' })
export class DeviceTokenController {
  constructor(private readonly tokens: DeviceTokenService) {}

  @Post('push-token')
  @ApiOperation({ summary: 'Register FCM device token for push notifications' })
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RegisterPushTokenDto,
  ) {
    const data = await this.tokens.register(user.id, body);
    return { success: true, data };
  }

  @Delete('push-token')
  @ApiOperation({ summary: 'Remove FCM device token (e.g. on logout)' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RemovePushTokenDto,
  ) {
    const data = await this.tokens.remove(user.id, body.token);
    return { success: true, data };
  }
}
