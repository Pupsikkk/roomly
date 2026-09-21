import type { DomainEvent, EventPublisher } from '../ports/event-publisher.port';

/** Collects published domain events for assertions. */
export class FakeEventPublisher implements EventPublisher {
  readonly published: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.published.push(event);
  }
}
