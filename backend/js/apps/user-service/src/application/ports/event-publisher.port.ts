export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export type UserCreatedNotification = {
  id: string;
  email: string;
};

/** Outbound domain notifications (wire format lives in the messaging adapter). */
export interface EventPublisher {
  publishUserCreated(user: UserCreatedNotification): Promise<void>;
}
