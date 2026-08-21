import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountMinor?: number;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  reason?: string;
}

export class AdminRefundParamsDto {
  @IsUUID()
  id!: string;
}
