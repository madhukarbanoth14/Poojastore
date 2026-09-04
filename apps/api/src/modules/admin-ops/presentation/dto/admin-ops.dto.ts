import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PromoDiscountType } from '@prisma/client';

export class AdminListQueryDto {
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
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;
}

export class AdminFulfillDto {
  @IsIn(['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'])
  step!: 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

  @IsOptional()
  @IsString()
  @MaxLength(40)
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  courierName?: string;
}

export class AdminDispatchVendorDto {
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  vendorPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  vendorName?: string;
}

export class CreatePromoDto {
  @IsString()
  @MaxLength(40)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  description?: string;

  @IsEnum(PromoDiscountType)
  discountType!: PromoDiscountType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  percentOff?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  amountMinor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minSubtotalMinor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  maxDiscountMinor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromoDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  percentOff?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  amountMinor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minSubtotalMinor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxDiscountMinor?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxRedemptions?: number | null;

  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @IsOptional()
  @IsDateString()
  endsAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
