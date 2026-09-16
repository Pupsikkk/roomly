import { Module } from '@nestjs/common';
import { RabbitmqModule } from '@roomly/infra';
import { EVENT_PUBLISHER } from '../../../application/ports/event-publisher.port';
import { RabbitEventPublisher } from './rabbit-event.publisher';

@Module({
  imports: [RabbitmqModule.forRoot()],
  providers: [
    {
      provide: EVENT_PUBLISHER,
      useClass: RabbitEventPublisher,
    },
  ],
  exports: [EVENT_PUBLISHER, RabbitmqModule],
})
export class EventsModule {}
