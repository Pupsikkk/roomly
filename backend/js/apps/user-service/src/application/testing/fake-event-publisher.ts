import type {
  EventPublisher,
  UserCreatedNotification,
} from '../ports/event-publisher.port';

/** Collects publishUserCreated calls for assertions. */
export class FakeEventPublisher implements EventPublisher {
  readonly published: UserCreatedNotification[] = [];

  async publishUserCreated(user: UserCreatedNotification): Promise<void> {
    this.published.push(user);
  }
}
