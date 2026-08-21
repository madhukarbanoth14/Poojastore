import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ListPrasadQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  festival?: string;
}

export class UpsertVratReminderDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(14)
  remindDaysBefore?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpsertVratGuideDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(280)
  summary!: string;

  @IsString()
  description!: string;

  @IsString()
  @MaxLength(160)
  durationHint!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFoods?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoidFoods?: string[];

  @IsString()
  breakFastHow!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  associatedPuja?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  relatedVidhiSlug?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class PrasadStepDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stepNumber!: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsString()
  instruction!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  audioUrl?: string;
}

export class UpsertPrasadRecipeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(280)
  summary!: string;

  @IsString()
  @MaxLength(120)
  festivalName!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  servings!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  prepMinutes!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(512)
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  relatedProductSlug?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => PrasadStepDto)
  steps?: PrasadStepDto[];
}
