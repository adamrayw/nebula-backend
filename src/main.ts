import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.listen(8004);

  // Create a microservice
  const microservice = app.connectMicroservice({
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
  });

  await microservice.listen();
  console.log('Notification microservice is listening!');
}
bootstrap();
