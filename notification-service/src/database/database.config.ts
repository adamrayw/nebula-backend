import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Notification } from 'src/notification/entities/notification.entity';

export const dataBaseConfig: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'notification_db',
  models: [Notification],
  autoLoadModels: true,
  synchronize: false,
};
