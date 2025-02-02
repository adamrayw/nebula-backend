import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './entities/payment.entity';
import { HttpModule } from '@nestjs/axios';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [SequelizeModule.forFeature([Payment]), HttpModule, RabbitmqModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
