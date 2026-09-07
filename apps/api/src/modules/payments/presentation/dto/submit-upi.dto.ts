import { IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

export class SubmitUpiDto {
  @IsOptional()
  @ValidateIf((_, value) => value != null && String(value).trim() !== '')
  @IsString()
  @Matches(/^[A-Za-z0-9]{8,22}$/, {
    message: 'Enter the 8–22 character UPI reference / UTR from your payment app',
  })
  utr?: string;

  @IsOptional()
  @IsString()
  screenshotBase64?: string;
}
