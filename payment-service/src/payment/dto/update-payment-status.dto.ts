import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdatePaymentStatusDto extends PartialType(CreatePaymentDto) {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  transaction_status: string;
}
