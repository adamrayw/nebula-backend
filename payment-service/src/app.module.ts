import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { PaymentModule } from './payment/payment.module';
import { PricingModule } from './pricing/pricing.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { Payment } from './payment/entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SequelizeModuleOptions => ({
        dialect: 'postgres',
        host: configService.get('PAYMENT_DB_HOST'),
        port: configService.get('PAYMENT_DB_PORT'),
        username: configService.get('PAYMENT_DB_USERNAME'),
        password: configService.get('PAYMENT_DB_PASSWORD'),
        database: configService.get('PAYMENT_DB_NAME'),
        models: [Payment],
        autoLoadModels: true,
        synchronize: false,
      }),
    }),
    PaymentModule,
    PricingModule,
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({
        path: 'api/payments/notification/handling',
        method: RequestMethod.POST,
      })
      .forRoutes('api/payments');
  }
}
