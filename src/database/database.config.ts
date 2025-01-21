import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Payment } from 'src/payment/entities/payment.entity';

export const dataBaseConfig: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'payment_db',
  models: [Payment],
  autoLoadModels: true,
  synchronize: false,
};
