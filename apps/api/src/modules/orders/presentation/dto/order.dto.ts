import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CheckoutDto {
  @IsUUID()
  shippingAddressId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  deliverySlot?: string;
}

export class OrderActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
