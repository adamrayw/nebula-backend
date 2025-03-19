import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationData } from 'src/interfaces/notification-create.interface';
import { NotificationService } from './notification.service';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { ResponseMessage } from 'src/common/decorator/response-message.decorator';
import { Request } from 'express';

/* The line `const SEND_NOTIFICATION_SERVICE = 'SEND_NOTIFICATION_SERVICE';` is defining a constant
variable named `SEND_NOTIFICATION_SERVICE` with the value `'SEND_NOTIFICATION_SERVICE'`. This
constant is being used as the event pattern in the `@EventPattern` decorator in the
`getNotification` method of the `NotificationController` class. */
const SEND_NOTIFICATION_SERVICE = 'SEND_NOTIFICATION_SERVICE';

@Controller('api/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('create_link_success')
  getNotificationCreateLinkSuccess(@Payload() data: NotificationData) {
    return this.notificationService.saveNotification(data);
  }
  
  @EventPattern('payment_success')
  getPaymentSuccess(@Payload() data: NotificationData) {
    return this.notificationService.saveNotification(data);
  }

  @Get('')
  @UseInterceptors(TransformInterceptor)
  @ResponseMessage('Notifications retrieved successfully')
  getNotificationsByUserId(@Req() req: Request & { user: { id: string } }) {
    const userId = req.user.id;
    return this.notificationService.getNotificationsByUserId(userId);
  }
}
