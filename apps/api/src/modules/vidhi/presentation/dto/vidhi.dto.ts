import { VidhiCategory, VidhiDifficulty } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ListVidhiQueryDto {
  @IsOptional()
  @IsEnum(VidhiCategory)
  category?: VidhiCategory;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  language?: string;
}

export class VidhiStepDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  stepNumber!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(5)
  instruction!: string;

  @IsOptional()
  @IsString()
  transliteration?: string;

  @IsOptional()
  @IsString()
  meaning?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationSeconds?: number;
}

export class VidhiMantraDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(2)
  sanskritText!: string;

  @IsString()
  @MinLength(2)
  transliteration!: string;

  @IsString()
  @MinLength(2)
  meaning!: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpsertVidhiDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(280)
  summary!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(VidhiCategory)
  category!: VidhiCategory;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  language?: string;

  @IsString()
  @MinLength(5)
  bestTimeHint!: string;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(600)
  durationMinutes!: number;

  @IsOptional()
  @IsEnum(VidhiDifficulty)
  difficulty?: VidhiDifficulty;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsUrl()
  audioNarrationUrl?: string;

  @IsOptional()
  @IsUrl()
  videoDemoUrl?: string;

  @IsOptional()
  @IsString()
  kathaText?: string;

  @IsOptional()
  @IsUrl()
  kathaAudioUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  relatedProductSlug?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VidhiStepDto)
  steps!: VidhiStepDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VidhiMantraDto)
  mantras?: VidhiMantraDto[];
}
