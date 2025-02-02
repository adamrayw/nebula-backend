import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);

  const microservice = app.connectMicroservice<MicroserviceOptions>({
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
  console.log(`Microservice is listening`);
}
void bootstrap();
