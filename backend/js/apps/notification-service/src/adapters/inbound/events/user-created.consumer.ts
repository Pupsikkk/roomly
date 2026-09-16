import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  USER_EVENTS_EXCHANGE,
  USER_EVENT_TYPES,
  userEventQueueName,
  type UserCreatedEvent,
} from '@roomly/contracts';
import { RabbitmqConnectionService } from '@roomly/infra';

@Injectable()
export class UserCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserCreatedConsumer.name);

  constructor(private readonly rabbit: RabbitmqConnectionService) {}

  async onModuleInit() {
    const channel = await this.rabbit.getChannel();
    const queue = userEventQueueName('notification', USER_EVENT_TYPES.CREATED);

    await channel.assertExchange(USER_EVENTS_EXCHANGE, 'topic', {
      durable: true,
    });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(
      queue,
      USER_EVENTS_EXCHANGE,
      USER_EVENT_TYPES.CREATED,
    );

    await channel.consume(queue, (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString()) as UserCreatedEvent;
        this.logger.log(
          `user.created received id=${event.payload.id} email=${event.payload.email} at=${event.occurredAt}`,
        );
        channel.ack(msg);
      } catch (error) {
        this.logger.error(
          'Failed to process user.created',
          error instanceof Error ? error.stack : String(error),
        );
        channel.nack(msg, false, false);
      }
    });

    this.logger.log(`Consuming ${queue} ← ${USER_EVENTS_EXCHANGE}`);
  }
}
