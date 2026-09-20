import { startOtel } from '@roomly/common/otel/start-otel';

/** Side-effect: must be the first import in main.ts (direct path — avoid barrel loading Nest/http first). */
startOtel('notification-service');
