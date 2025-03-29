import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.use(compression());
  await app.listen(process.env.NOTIFICATION_PORT ?? 3000);

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL
      ],
      queue: 'notification_queue',
      queueOptions: {
        durable: false,
        deadLetterExchange: 'dlx',
      },
    },
  });

  await microservice.listen();
  console.log(`📣 Microservice is listening`);
}
void bootstrap();
