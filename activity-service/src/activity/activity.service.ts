import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Activity, ActivityData } from 'src/entities/activity.entity';

@Injectable()
export class ActivityService {
    constructor(
        @InjectModel(Activity)
        private activityModel: typeof Activity,
    ) { }

    async getActivities(userId: string, order: string, search: string) {

        if(order === 'ascending') {
            order = 'ASC';
        } else {
            order = 'DESC';
        }

        const whereClause: any = {
            userId,
        };

        if(search) {
            whereClause.description = {
                [Op.iLike]: `%${search}%`,
            };
        }

        return await this.activityModel
            .findAll({
                where: whereClause,
                order: [['createdAt', order]],
            });
    }

    async saveActivity(data: ActivityData) {
        console.log(data)
        return await this.activityModel.create(data);
    }
}
