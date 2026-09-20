import { isSpanContextValid, trace } from '@opentelemetry/api';
import { LoggerModule, type Params } from 'nestjs-pino';
import { multistream } from 'pino';
import { createPinoOtelStream } from './pino-otel-stream';

function otlpLogsEnabled(): boolean {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) return false;
  const v = (process.env.OTEL_LOGS_EXPORTER ?? 'otlp').toLowerCase();
  return v !== 'none' && v !== 'false';
}

/** Strip Set-Cookie from the access-log object (tokens must not hit Loki/stdout). */
function stripSetCookieFromLogObject<T extends Record<string, unknown>>(
  loggable: T,
): T {
  const res = loggable.res;
  if (!res || typeof res !== 'object') return loggable;
  const headers = (res as { headers?: Record<string, unknown> }).headers;
  if (!headers || !('set-cookie' in headers)) return loggable;
  const nextHeaders = { ...headers };
  delete nextHeaders['set-cookie'];
  return {
    ...loggable,
    res: { ...res, headers: nextHeaders },
  };
}

/**
 * nestjs-pino LoggerModule: JSON stdout (console) + optional OTLP → Collector → Loki.
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
    customSuccessObject: (_req, _res, val) => stripSetCookieFromLogObject(val),
    customErrorObject: (_req, _res, _err, val) =>
      stripSetCookieFromLogObject(val),
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
      remove: true,
    },
    autoLogging: {
      ignore: (req) => {
        const url = req.url ?? '';
        return (
          url === '/health' ||
          url.startsWith('/health?') ||
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
    // Pretty transport uses a worker; OTLP export is skipped in this mode.
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
  } else if (otlpLogsEnabled()) {
    // Stdout for local console; OTLP for Loki (via Collector).
    Object.assign(pinoHttp, {
      stream: multistream([
        { stream: process.stdout },
        { stream: createPinoOtelStream() },
      ]),
    });
  }

  return LoggerModule.forRoot({ pinoHttp });
}
