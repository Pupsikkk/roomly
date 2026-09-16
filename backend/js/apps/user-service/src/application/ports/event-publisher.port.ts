import type { UserDomainEvent } from '@roomly/contracts';

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

/** Application-level events (routing key = event.type in Rabbit adapter) */
export type DomainEvent = UserDomainEvent;

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
