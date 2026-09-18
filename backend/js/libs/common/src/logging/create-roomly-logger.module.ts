import { isSpanContextValid, trace } from '@opentelemetry/api';
import { LoggerModule, type Params } from 'nestjs-pino';

/**
 * nestjs-pino LoggerModule: JSON stdout + OTel `trace_id` / `span_id` mixin.
 * Import once per app module; bootstrap with bufferLogs + app.useLogger(Logger).
 */
export function createRoomlyLoggerModule(serviceName: string) {
  const service =
    process.env.OTEL_SERVICE_NAME?.trim() || serviceName.trim() || 'app';

  const pinoHttp: Params['pinoHttp'] = {
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service },
    messageKey: 'message',
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      remove: true,
    },
    autoLogging: {
      ignore: (req) => {
        const url = req.url ?? '';
        return (
          url === '/health' ||
          url.startsWith('/health?') ||
          url === '/metrics' ||
          url.startsWith('/metrics?') ||
          url === '/json/version' ||
          url.startsWith('/json/version?')
        );
      },
    },
    mixin() {
      const span = trace.getActiveSpan();
      if (!span) return {};
      const ctx = span.spanContext();
      if (!isSpanContextValid(ctx)) return {};
      return {
        trace_id: ctx.traceId,
        span_id: ctx.spanId,
      };
    },
  };

  if (process.env.LOG_PRETTY === 'true') {
    // Docker compose often has no TTY — force ANSI so level colors show up.
    process.env.FORCE_COLOR ??= '1';
    Object.assign(pinoHttp, {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          colorizeObjects: true,
          singleLine: false,
          messageKey: 'message',
          timestampKey: 'timestamp',
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname',
          customColors:
            'trace:magenta,debug:blue,info:green,warn:yellow,error:red,fatal:bgRed',
          messageFormat: '{service}{if context} [{context}]{end} {message}',
        },
      },
    });
  }

  return LoggerModule.forRoot({ pinoHttp });
}
