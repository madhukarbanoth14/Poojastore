import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SavedSamagriItemDto } from './scan.dto';

export class SendPoojariSamagriTextDto {
  @IsUUID()
  bookingId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  text!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}

export class SendPoojariSamagriItemsDto {
  @IsUUID()
  bookingId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  rawText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SavedSamagriItemDto)
  items!: SavedSamagriItemDto[];
}
