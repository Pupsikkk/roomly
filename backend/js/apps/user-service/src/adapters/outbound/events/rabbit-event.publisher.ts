import { Injectable, Logger } from '@nestjs/common';
import { USER_EVENTS_EXCHANGE } from '@roomly/contracts';
import { RabbitmqConnectionService } from '@roomly/infra';
import type {
  DomainEvent,
  EventPublisher,
} from '../../../application/ports/event-publisher.port';

@Injectable()
export class RabbitEventPublisher implements EventPublisher {
  private readonly logger = new Logger(RabbitEventPublisher.name);
  private exchangeReady = false;

  constructor(private readonly rabbit: RabbitmqConnectionService) {}

  async publish(event: DomainEvent): Promise<void> {
    const channel = await this.rabbit.getChannel();
    if (!this.exchangeReady) {
      await channel.assertExchange(USER_EVENTS_EXCHANGE, 'topic', {
        durable: true,
      });
      this.exchangeReady = true;
    }

    channel.publish(
      USER_EVENTS_EXCHANGE,
      event.type,
      Buffer.from(JSON.stringify(event)),
      {
        contentType: 'application/json',
        persistent: true,
      },
    );

    this.logger.debug(`Published ${event.type}`);
  }
}
