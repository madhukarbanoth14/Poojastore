import { KidsAgeBand } from '@prisma/client';
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
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ListKidsStoriesQueryDto {
  @IsOptional()
  @IsEnum(KidsAgeBand)
  ageBand?: KidsAgeBand;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  language?: string;
}

export class QuizAnswerDto {
  @IsUUID()
  questionId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9)
  selectedIndex!: number;
}

export class SubmitQuizDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers!: QuizAnswerDto[];
}

export class KidsStoryPageDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber!: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsString()
  @MinLength(5)
  body!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;
}

export class KidsQuizQuestionDto {
  @IsString()
  @MinLength(5)
  prompt!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  options!: string[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  correctIndex!: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpsertKidsStoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(280)
  summary!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  festivalName!: string;

  @IsString()
  @MinLength(5)
  whyCelebrated!: string;

  @IsString()
  @MinLength(5)
  importance!: string;

  @IsOptional()
  @IsEnum(KidsAgeBand)
  ageBand?: KidsAgeBand;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  language?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

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
  @Min(0)
  sortOrder?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KidsStoryPageDto)
  pages!: KidsStoryPageDto[];

  @IsOptional()
  @IsString()
  @MaxLength(160)
  quizTitle?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quizPassScore?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KidsQuizQuestionDto)
  quizQuestions?: KidsQuizQuestionDto[];
}
