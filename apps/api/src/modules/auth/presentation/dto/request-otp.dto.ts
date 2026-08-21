import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OtpPurpose } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '91', description: 'Country calling code without +' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{1,3}$/)
  countryCode!: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8,15}$/)
  phone!: string;

  @ApiPropertyOptional({ enum: OtpPurpose })
  @IsOptional()
  @IsEnum(OtpPurpose)
  purpose?: OtpPurpose;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '91' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{1,3}$/)
  countryCode!: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8,15}$/)
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4,10}$/)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  preferredLanguage?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceId?: string;
}

export class LogoutDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
