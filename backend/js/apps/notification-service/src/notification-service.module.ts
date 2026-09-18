import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  createRoomlyLoggerModule,
  HealthModule,
  RoomlyConfigModule,
  UnhandledExceptionFilter,
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
  providers: [
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionFilter,
    },
  ],
})
export class NotificationServiceModule {}
