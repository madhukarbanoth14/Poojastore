import { ApiPropertyOptional } from '@nestjs/swagger';
import { Rasi } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class PanchangQueryDto {
  @ApiPropertyOptional({ example: 'Hyderabad' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CalendarQueryDto extends PanchangQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}

export class UpsertBirthProfileDto {
  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  birthTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  birthPlace?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  birthLatitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  birthLongitude?: number;

  @IsEnum(Rasi)
  rasi!: Rasi;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  nakshatra?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  gotram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  cityName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cityLatitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cityLongitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}

export class UpsertGuidanceDto {
  @IsString()
  @MinLength(10)
  summary!: string;

  @IsString()
  recommendedPuja!: string;

  @IsString()
  activity!: string;

  @IsString()
  luckyColor!: string;

  @IsString()
  luckyDirection!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  luckyNumber!: number;

  @IsString()
  career!: string;

  @IsString()
  finance!: string;

  @IsString()
  health!: string;

  @IsString()
  travel!: string;
}
