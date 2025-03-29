import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
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
  getActivities(@Param('userId') userId: string, @Query('order') order: string, @Query('search') search: string) {
    return this.activityService.getActivities(userId, order, search);
  }

  @EventPattern('activity_queue')
  saveActivity(@Payload() data: any, @Ctx() context: RmqContext) {

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);

    return this.activityService.saveActivity(data);
  }
}
