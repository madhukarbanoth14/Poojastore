import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class SubmitUpiDto {
  @ApiProperty({
    example: '542696738084',
    description: '12-digit UPI UTR from the payment success screen',
  })
  @IsString()
  @Matches(/^[0-9]{12}$/, {
    message:
      'Enter the exact 12-digit UTR from PhonePe / Google Pay / Paytm. This reference is not valid.',
  })
  utr!: string;

  @ApiProperty({
    example: 111100,
    description: 'Amount paid in paise — must match the order QR amount',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50_000_000)
  amountPaidMinor!: number;

  @ApiProperty({
    description: 'Payment success screenshot as a data URL or base64 (required)',
  })
  @IsString()
  screenshotBase64!: string;
}
