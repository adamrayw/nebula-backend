import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 8083);

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        'amqps://xdffzfle:pr60yVCQXdjLXB2MJO7GFR7ebyI8tTVZ@jaragua.lmq.cloudamqp.com/xdffzfle',
      ],
      queue: 'payment_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await microservice.listen();
  console.log(`Microservice is listening`);
}
bootstrap();
