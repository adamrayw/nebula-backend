import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { NotificationData } from 'src/interfaces/notification-create.interface';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification)
    private notificatinModel: typeof Notification,
  ) {}

  async saveNotification(data: NotificationData) {
    return await this.notificatinModel.create(data);
  }

  async getNotificationsByUserId(userId: string) {
    return await this.notificatinModel.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }
}
