import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PrismaService } from '../../../core/database/prisma.service';

class AddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  line1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  line2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

class CreateAddressDto {
  @IsString()
  @MaxLength(40)
  label!: string;

  @IsString()
  @MaxLength(180)
  line1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  line2?: string;

  @IsString()
  @MaxLength(80)
  city!: string;

  @IsString()
  @MaxLength(80)
  state!: string;

  @IsString()
  @MaxLength(20)
  postalCode!: string;

  @IsString()
  @Length(2, 2)
  country!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller({ path: 'addresses', version: '1' })
export class AddressesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List my addresses' })
  async list(@CurrentUser() user: AuthenticatedUser) {
    const items = await this.prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return { success: true, data: { items } };
  }

  @Post()
  @ApiOperation({ summary: 'Create address' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAddressDto,
  ) {
    if (dto.isDefault) {
      await this.clearDefault(user.id);
    }

    const address = await this.prisma.address.create({
      data: {
        userId: user.id,
        label: dto.label,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country.toUpperCase(),
        isDefault: dto.isDefault ?? false,
      },
    });
    return { success: true, data: address };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddressDto,
  ) {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new NotFoundException('Address not found');
    if (dto.isDefault) {
      await this.clearDefault(user.id);
    }
    const address = await this.prisma.address.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.line1 !== undefined ? { line1: dto.line1 } : {}),
        ...(dto.line2 !== undefined ? { line2: dto.line2 } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.state !== undefined ? { state: dto.state } : {}),
        ...(dto.postalCode !== undefined ? { postalCode: dto.postalCode } : {}),
        ...(dto.country !== undefined ? { country: dto.country.toUpperCase() } : {}),
        ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
      },
    });
    return { success: true, data: address };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id } });
    return { success: true, data: { deleted: true } };
  }

  private clearDefault(userId: string) {
    return this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
}
