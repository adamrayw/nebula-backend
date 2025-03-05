import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ActivityService } from './activity.service';
import { ResponseMessage } from 'src/common/decorator/response-message.decorator';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';

@Controller('api/activity')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
  ) {}

  @Get(':userId')
  @UseInterceptors(TransformInterceptor)
  @ResponseMessage('Activities retrieved successfully')
  getActivities(@Param('userId') userId: string) {
    return this.activityService.getActivities(userId);
  }

  @EventPattern('activity_queue')
  saveActivity(@Payload() data: any) {
    console.log(data);
    return this.activityService.saveActivity(data);
  }
}
