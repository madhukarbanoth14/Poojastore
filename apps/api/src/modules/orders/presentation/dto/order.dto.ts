import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CheckoutDto {
  @IsUUID()
  shippingAddressId!: string;

  @IsOptional()
  @IsUUID()
  familyAddressId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  deliverySlot?: string;

  @IsOptional()
  @IsIn(['self', 'family', 'refer'])
  intent?: 'self' | 'family' | 'refer';

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(['self', 'family', 'refer'], { each: true })
  intents?: Array<'self' | 'family' | 'refer'>;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  familyRelationship?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  promoCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;
}

export class OrderActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

export class ReferKitDto {
  @IsString()
  @MaxLength(80)
  recipientName!: string;

  @IsString()
  @MaxLength(20)
  recipientPhone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  kitName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  shopUrl?: string;
}
