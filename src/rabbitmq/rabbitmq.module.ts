import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://xdffzfle:pr60yVCQXdjLXB2MJO7GFR7ebyI8tTVZ@jaragua.lmq.cloudamqp.com/xdffzfle',
          ],
          queue: 'notification_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitmqModule {}
