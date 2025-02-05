import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { Notification } from './notification/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SequelizeModuleOptions => ({
        dialect: 'postgres',
        host: configService.get('NOTIFICATION_DB_HOST'),
        port: configService.get('NOTIFICATION_DB_PORT'),
        username: configService.get('NOTIFICATION_DB_USERNAME'),
        password: configService.get('NOTIFICATION_DB_PASSWORD'),
        database: configService.get('NOTIFICATION_DB_NAME'),
        models: [Notification],
        autoLoadModels: true,
        synchronize: false,
      }),
    }),
    RabbitmqModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      // .exclude({
      //   path: 'api/payments/notification/handling',
      //   method: RequestMethod.POST,
      // })
      .forRoutes('api/notification');
  }
}
