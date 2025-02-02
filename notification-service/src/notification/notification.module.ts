import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [SequelizeModule.forFeature([Notification]), RabbitmqModule],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
