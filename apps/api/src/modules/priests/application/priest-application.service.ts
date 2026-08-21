import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PriestApplicationStatus,
  Role,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  InvalidPhoneError,
  normalizePhone,
} from '../../auth/domain/phone';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import {
  ApplyPriestDto,
  ReviewPriestApplicationDto,
} from '../presentation/dto/priest.dto';

@Injectable()
export class PriestApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(dto: ApplyPriestDto, user?: AuthenticatedUser) {
    let phone;
    try {
      phone = normalizePhone(dto.countryCode, dto.phone);
    } catch (error) {
      if (error instanceof InvalidPhoneError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const offersHome = dto.offersHome ?? true;
    const offersOnline = dto.offersOnline ?? false;
    if (!offersHome && !offersOnline) {
      throw new BadRequestException(
        'Select home visits, online consultations, or both.',
      );
    }

    const serviceFees = this.normalizeFees(dto, offersHome, offersOnline);
    const homePrices = serviceFees
      .map((fee) => fee.homeVisitInr)
      .filter((value): value is number => value != null);
    const onlinePrices = serviceFees
      .map((fee) => fee.onlineInr)
      .filter((value): value is number => value != null);
    const startingInr = Math.min(
      ...(homePrices.length ? homePrices : onlinePrices),
    );
    if (!Number.isFinite(startingInr)) {
      throw new BadRequestException('Enter a price for at least one pooja.');
    }

    const payload = {
      userId: user?.id ?? null,
      fullName: dto.fullName.trim(),
      phoneE164: phone.phoneE164,
      countryCode: phone.countryCode,
      phoneNational: phone.phoneNational,
      city: dto.city.trim(),
      state: dto.state.trim(),
      languages: dto.languages.map((item) => item.trim()).filter(Boolean),
      specializations: serviceFees.map((fee) => fee.pooja),
      yearsExperience: dto.yearsExperience,
      bio: dto.bio.trim(),
      basePriceMinor: startingInr * 100,
      travelFeeMinor: (dto.travelFeeInr ?? 0) * 100,
      serviceFees,
      offersHome,
      offersOnline,
      status: PriestApplicationStatus.PENDING,
      reviewNote: null,
    };

    const existing = await this.prisma.priestApplication.findFirst({
      where: {
        phoneE164: phone.phoneE164,
        status: PriestApplicationStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    const row = existing
      ? await this.prisma.priestApplication.update({
          where: { id: existing.id },
          data: payload,
        })
      : await this.prisma.priestApplication.create({ data: payload });

    return {
      id: row.id,
      status: row.status,
      fullName: row.fullName,
      message:
        'Thank you. We will review your details and add you to Pooja Store.',
    };
  }

  async list(status?: PriestApplicationStatus) {
    const items = await this.prisma.priestApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { items };
  }

  async approve(id: string, body: ReviewPriestApplicationDto) {
    const application = await this.prisma.priestApplication.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== PriestApplicationStatus.PENDING) {
      throw new BadRequestException('Application is not pending');
    }

    const slug = await this.uniqueSlug(application.fullName);
    const user = await this.prisma.user.findUnique({
      where: { phoneE164: application.phoneE164 },
    });
    let userId = user?.id ?? application.userId ?? null;
    if (userId) {
      const taken = await this.prisma.priest.findUnique({ where: { userId } });
      if (taken) userId = null;
    }

    const priest = await this.prisma.$transaction(async (tx) => {
      const created = await tx.priest.create({
        data: {
          slug,
          userId,
          fullName: application.fullName.startsWith('Pandit')
            ? application.fullName
            : `Pandit ${application.fullName}`,
          bio: application.bio,
          city: application.city,
          state: application.state,
          languages: application.languages,
          specializations: application.specializations,
          yearsExperience: application.yearsExperience,
          basePriceMinor: application.basePriceMinor,
          travelFeeMinor: application.travelFeeMinor,
          serviceFees: application.serviceFees ?? [],
          isActive: true,
          sortOrder: 50,
        },
      });

      if (user && user.role === Role.CUSTOMER) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            role: Role.POOJARI,
            status: UserStatus.ACTIVE,
            fullName: user.fullName ?? application.fullName,
          },
        });
      }

      await tx.priestApplication.update({
        where: { id: application.id },
        data: {
          status: PriestApplicationStatus.APPROVED,
          reviewNote: body.note ?? null,
          priestId: created.id,
        },
      });

      return created;
    });

    return { applicationId: application.id, priest };
  }

  async reject(id: string, body: ReviewPriestApplicationDto) {
    const application = await this.prisma.priestApplication.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== PriestApplicationStatus.PENDING) {
      throw new BadRequestException('Application is not pending');
    }
    return this.prisma.priestApplication.update({
      where: { id },
      data: {
        status: PriestApplicationStatus.REJECTED,
        reviewNote: body.note ?? null,
      },
    });
  }

  private async uniqueSlug(fullName: string) {
    const base =
      fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'pujari';
    const existing = await this.prisma.priest.findUnique({
      where: { slug: base },
    });
    if (!existing) return base;
    return `${base}-${Date.now().toString(36).slice(-6)}`;
  }

  private normalizeFees(
    dto: ApplyPriestDto,
    offersHome: boolean,
    offersOnline: boolean,
  ) {
    const fromCards = (dto.serviceFees ?? [])
      .map((fee) => ({
        pooja: fee.pooja.trim(),
        homeVisitInr: offersHome ? fee.homeVisitInr : undefined,
        onlineInr: offersOnline ? fee.onlineInr : undefined,
      }))
      .filter((fee) => fee.pooja);

    const fromLegacy = (dto.specializations ?? [])
      .map((name) => name.trim())
      .filter((name) => name && name.toLowerCase() !== 'online consultation')
      .map((pooja) => ({
        pooja,
        homeVisitInr: offersHome ? dto.basePriceInr : undefined,
        onlineInr: offersOnline ? dto.basePriceInr : undefined,
      }));

    const serviceFees = fromCards.length ? fromCards : fromLegacy;
    if (!serviceFees.length) {
      throw new BadRequestException('Select at least one pooja.');
    }

    for (const fee of serviceFees) {
      if (offersHome && (fee.homeVisitInr == null || fee.homeVisitInr < 300)) {
        throw new BadRequestException(
          `Enter a home-visit price for ${fee.pooja}.`,
        );
      }
      if (offersOnline && (fee.onlineInr == null || fee.onlineInr < 300)) {
        throw new BadRequestException(
          `Enter an online consultation price for ${fee.pooja}.`,
        );
      }
    }

    return serviceFees;
  }
}
