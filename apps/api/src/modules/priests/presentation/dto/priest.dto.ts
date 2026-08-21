import { Market, PriestApplicationStatus, PriestServiceMode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ListPriestsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  specialization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  language?: string;

  @IsOptional()
  @IsEnum(Market)
  market?: Market;
}

export class CreatePriestBookingDto {
  @IsUUID()
  slotId!: string;

  @IsUUID()
  addressId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  serviceName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsEnum(PriestServiceMode)
  serviceMode?: PriestServiceMode;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  reason?: string;
}

export class RescheduleBookingDto {
  @IsUUID()
  newSlotId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  reason?: string;
}

export class PoojaServiceFeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  pooja!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(300)
  @Max(25000)
  homeVisitInr?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(300)
  @Max(25000)
  onlineInr?: number;
}

export class ApplyPriestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @Matches(/^\d{1,3}$/)
  countryCode!: string;

  @IsString()
  @Matches(/^\d{8,15}$/)
  phone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  state!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  languages!: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => PoojaServiceFeeDto)
  serviceFees?: PoojaServiceFeeDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  specializations?: string[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(70)
  yearsExperience!: number;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  bio!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(300)
  @Max(25000)
  basePriceInr?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5000)
  travelFeeInr?: number;

  @IsOptional()
  @IsBoolean()
  offersHome?: boolean;

  @IsOptional()
  @IsBoolean()
  offersOnline?: boolean;
}

export class ListPriestApplicationsQueryDto {
  @IsOptional()
  @IsEnum(PriestApplicationStatus)
  status?: PriestApplicationStatus;
}

export class ReviewPriestApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;
}
