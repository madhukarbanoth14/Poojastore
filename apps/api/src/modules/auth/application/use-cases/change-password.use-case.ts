import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../core/database/prisma.service';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: {
    userId: string;
    currentPassword?: string;
    newPassword: string;
  }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { id: true, passwordHash: true },
    });

    if (user.passwordHash) {
      if (!input.currentPassword) {
        throw new BadRequestException('Current password is required');
      }
      const valid = await bcrypt.compare(
        input.currentPassword,
        user.passwordHash,
      );
      if (!valid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_PASSWORD_CHANGED',
        resource: 'auth',
        metadata: { hadPassword: Boolean(user.passwordHash) },
      },
    });

    return { updated: true, hasPassword: true };
  }
}
