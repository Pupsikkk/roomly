export { createRoomlyLoggerModule } from './create-roomly-logger.module';
export { createPinoOtelStream } from './pino-otel-stream';
export { recordActiveSpanError } from './record-active-span-error';
export { startOtel } from './start-otel';
export { ExcludeTracer, Traced, withSpan } from './traced';
export type { SpanWork, TracedOptions, WithSpanOptions } from './traced';
export { UnhandledExceptionFilter } from './unhandled-exception.filter';
