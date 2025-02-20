import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.use(compression());
  await app.listen(process.env.PAYMENT_PORT ?? 8083);

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
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
