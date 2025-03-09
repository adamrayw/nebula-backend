import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Activity, ActivityData } from 'src/entities/activity.entity';

@Injectable()
export class ActivityService {
    constructor(
        @InjectModel(Activity)
        private activityModel: typeof Activity,
    ) { }

    async getActivities(userId: string) {
        return await this.activityModel
            .findAll({
                where: {
                    userId,
                },
                order: [['createdAt', 'DESC']],
            });
    }

    async saveActivity(data: ActivityData) {
        return await this.activityModel.create(data);
    }
}
