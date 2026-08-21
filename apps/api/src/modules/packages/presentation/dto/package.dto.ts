import { Market } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ListPackagesQueryDto {
  @IsOptional()
  @IsEnum(Market)
  market?: Market;
}

export class BookPackageDto {
  @IsUUID()
  addressId!: string;

  @IsOptional()
  @IsBoolean()
  includeKit?: boolean;

  @IsOptional()
  @IsBoolean()
  includePriest?: boolean;

  @IsOptional()
  @IsBoolean()
  includePrasad?: boolean;

  @IsOptional()
  @IsUUID()
  priestSlotId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  serviceName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  addonSlugs?: string[];
}

export class CancelPackageBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  reason?: string;
}
