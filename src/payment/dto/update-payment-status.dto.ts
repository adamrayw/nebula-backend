import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';

export class UpdatePaymentStatusDto extends PartialType(CreatePaymentDto) {
  id: string;
  order_id: string;
  transaction_status: string;
}
