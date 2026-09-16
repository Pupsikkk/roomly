import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationServiceService {
  getInfo() {
    return {
      service: 'notification-service',
      message: 'Notification service is running',
    };
  }
}
