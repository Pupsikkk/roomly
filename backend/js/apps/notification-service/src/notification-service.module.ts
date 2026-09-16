import { Module } from '@nestjs/common';
import { HealthModule, RoomlyConfigModule } from '@roomly/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';

@Module({
  imports: [
    RoomlyConfigModule.forRoot({
      load: ['services', 'rabbitmq'],
    }),
    HealthModule,
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
