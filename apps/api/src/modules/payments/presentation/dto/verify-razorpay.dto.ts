import { Type } from 'class-transformer';
import { IsString, IsUUID, Matches } from 'class-validator';

export class VerifyRazorpayDto {
  @IsUUID()
  paymentId!: string;

  @IsString()
  @Matches(/^order_/)
  razorpayOrderId!: string;

  @IsString()
  @Matches(/^pay_/)
  razorpayPaymentId!: string;

  @IsString()
  razorpaySignature!: string;
}
