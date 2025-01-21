import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  ParseUUIDPipe,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { ResponseMessage } from 'src/common/decorator/response-message.decorator';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseInterceptors(TransformInterceptor)
  @ResponseMessage('Payment created successfully')
  create(
    @Body('userId', ParseUUIDPipe) userId: string,
    @Body('price', ParseIntPipe) price: number,
    @Body('type') type: string,
    @Body('limit') limit: number,
  ) {
    return this.paymentService.create(userId, price, type, limit);
  }

  @Get('')
  @UseInterceptors(TransformInterceptor)
  @ResponseMessage('Payments retrieved successfully')
  findAll(@Req() req) {
    const userId = req.user.id;
    return this.paymentService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Post('notification/handling')
  notification(@Body() updatePaymentStatusDto: UpdatePaymentStatusDto) {
    return this.paymentService.update(updatePaymentStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
