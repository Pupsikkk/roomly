import { Module } from '@nestjs/common';
import {
  createRoomlyLoggerModule,
  HealthModule,
  RoomlyConfigModule,
} from '@roomly/common';
import { EventsModule } from './adapters/inbound/events/events.module';

@Module({
  imports: [
    createRoomlyLoggerModule('notification-service'),
    RoomlyConfigModule.forRoot({
      load: ['services', 'rabbitmq'],
    }),
    HealthModule,
    EventsModule,
  ],
})
export class NotificationServiceModule {}
