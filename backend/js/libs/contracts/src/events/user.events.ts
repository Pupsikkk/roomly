/** Topic exchange for user-service domain events */
export const USER_EVENTS_EXCHANGE = 'roomly.user.events';

export const USER_EVENT_TYPES = {
  CREATED: 'user.created',
} as const;

export type UserEventType =
  (typeof USER_EVENT_TYPES)[keyof typeof USER_EVENT_TYPES];

export type UserCreatedPayload = {
  id: string;
  email: string;
};

export type UserCreatedEvent = {
  type: typeof USER_EVENT_TYPES.CREATED;
  payload: UserCreatedPayload;
  occurredAt: string;
};

/** Discriminated union — expand when new user events appear */
export type UserDomainEvent = UserCreatedEvent;

export function userCreatedEvent(
  payload: UserCreatedPayload,
): UserCreatedEvent {
  return {
    type: USER_EVENT_TYPES.CREATED,
    payload,
    occurredAt: new Date().toISOString(),
  };
}

/**
 * Suggested queue name for a consumer binding to a user event type.
 * Example: `notification.user.created`
 */
export function userEventQueueName(
  consumer: string,
  eventType: UserEventType,
): string {
  return `${consumer}.${eventType}`;
}
