import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivityModule } from './activity/activity.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module'; 
import { ActivityController } from './activity/activity.controller';
import { ActivityService } from './activity/activity.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('ACTIVITY_DB_HOST'),
        port: configService.get('ACTIVITY_DB_PORT'),
        username: configService.get('ACTIVITY_DB_USERNAME'),
        password: configService.get('ACTIVITY_DB_PASSWORD'),
        database: configService.get('ACTIVITY_DB_NAME'),
        autoLoadModels: true,
        synchronize: false,
      }),
    }),
    RabbitmqModule,
    ActivityModule,
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
      .forRoutes('api/activity');
  }
}
