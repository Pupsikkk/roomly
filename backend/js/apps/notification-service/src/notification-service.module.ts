import { Module } from '@nestjs/common';
import { HealthModule, RoomlyConfigModule } from '@roomly/common';
import { EventsModule } from './adapters/inbound/events/events.module';

@Module({
  imports: [
    RoomlyConfigModule.forRoot({
      load: ['services', 'rabbitmq'],
    }),
    HealthModule,
    EventsModule,
  ],
})
export class NotificationServiceModule {}
