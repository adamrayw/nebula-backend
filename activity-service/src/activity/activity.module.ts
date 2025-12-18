import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { ActivityService } from './activity.service';
import { Activity } from 'src/entities/activity.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Activity]), RabbitmqModule],
  providers: [ActivityService],
  controllers: [ActivityController],
})
export class ActivityModule {}
