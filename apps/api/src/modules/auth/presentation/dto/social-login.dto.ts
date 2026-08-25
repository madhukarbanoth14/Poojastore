import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({ enum: ['GOOGLE', 'APPLE'] })
  @IsString()
  @IsIn(['GOOGLE', 'APPLE'])
  provider!: 'GOOGLE' | 'APPLE';

  @ApiPropertyOptional({
    description: 'ID token from Google or Apple Sign-In',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  idToken?: string;

  @ApiPropertyOptional({
    description:
      'Dev/staging only. Signs in a demo social account when SOCIAL_DEMO_LOGIN=true.',
  })
  @IsOptional()
  @IsBoolean()
  demo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceId?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  preferredLanguage?: string;
}
