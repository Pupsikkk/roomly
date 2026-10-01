import { startOtel } from '@roomly/common/otel/start-otel';

/** Side-effect: must be the first import in main.ts */
startOtel('media-service');
