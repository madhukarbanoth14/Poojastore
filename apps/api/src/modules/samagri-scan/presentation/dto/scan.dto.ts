import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScanTextDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  text!: string;
}

export class SavedSamagriItemDto {
  @IsUUID()
  productId!: string;

  @IsString()
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MaxLength(180)
  nameEn!: string;

  @IsString()
  @MaxLength(180)
  nameTe!: string;

  @IsInt()
  @Min(0)
  priceMinor!: number;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;
}

export class SaveSamagriListDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  rawText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SavedSamagriItemDto)
  items!: SavedSamagriItemDto[];
}
