import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [RabbitmqModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
