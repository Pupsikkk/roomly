import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import type { IncomingMessage } from 'node:http';

let started = false;

function incomingPath(req: IncomingMessage): string {
  return (req.url ?? '/').split('?')[0] || '/';
}

/** Health, Swagger UI/assets, favicon — not useful as root traces. */
function ignoreIncomingTrace(req: IncomingMessage): boolean {
  const path = incomingPath(req);
  return (
    path === '/health' ||
    path === '/favicon.ico' ||
    path === '/' ||
    path.startsWith('/docs')
  );
}

/**
 * Minimal OpenTelemetry traces to OTLP HTTP (Jaeger).
 * No-op unless OTEL_EXPORTER_OTLP_ENDPOINT is set.
 * Import apps/<service>/src/tracing.ts first in main.ts (side effect).
 */
export function startTracing(serviceName: string): void {
  if (started) return;
  if (process.env.OTEL_SDK_DISABLED === 'true') return;

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.replace(/\/$/, '');
  if (!endpoint) return;

  started = true;

  if (process.env.OTEL_LOG_LEVEL === 'debug') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const tracesUrl = endpoint.endsWith('/v1/traces')
    ? endpoint
    : `${endpoint}/v1/traces`;

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]:
        process.env.OTEL_SERVICE_NAME?.trim() || serviceName,
    }),
    traceExporter: new OTLPTraceExporter({ url: tracesUrl }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
        // Correlation via pino mixin in createRoomlyLoggerModule; avoid
        // duplicate fields / log export without a log pipeline.
        '@opentelemetry/instrumentation-pino': { enabled: false },
        // NestJS 11 / Express 5: router pkg duplicates express and emits
        // "middleware - patched" junk. Keep HTTP + Nest controller spans.
        '@opentelemetry/instrumentation-router': { enabled: false },
        // Express 5 + swagger-ui use /*splat catch-alls; express instrumentation
        // renames root spans to "GET {/*splat}{/*splat}" and hides real paths.
        '@opentelemetry/instrumentation-express': { enabled: false },
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook: ignoreIncomingTrace,
          requestHook(span, request) {
            // Incoming only (ClientRequest has no url string like IncomingMessage).
            if (!('url' in request) || typeof request.url !== 'string') return;
            const path = incomingPath(request);
            const method = request.method ?? 'HTTP';
            span.updateName(`${method} ${path}`);
          },
        },
        // Drop pg.connect / pg-pool.connect noise; keep query spans.
        '@opentelemetry/instrumentation-pg': {
          ignoreConnectSpans: true,
        },
        // Default span name is just "set"/"get"; mirror pg.query:* style.
        '@opentelemetry/instrumentation-ioredis': {
          requestHook(span, { cmdName, cmdArgs }) {
            const key = typeof cmdArgs[0] === 'string' ? cmdArgs[0] : undefined;
            span.updateName(key ? `redis ${cmdName} ${key}` : `redis ${cmdName}`);
          },
        },
        // Default is "publish <exchange>" / "<queue> process".
        '@opentelemetry/instrumentation-amqplib': {
          publishHook(span, { exchange, routingKey }) {
            const dest = exchange || routingKey || 'default';
            span.updateName(
              routingKey && exchange
                ? `RMQ publish ${exchange} ${routingKey}`
                : `RMQ publish ${dest}`,
            );
          },
          consumeHook(span, { msg }) {
            const dest =
              msg.fields?.routingKey || msg.fields?.exchange || 'queue';
            span.updateName(`RMQ process ${dest}`);
          },
        },
      }),
    ],
  });

  sdk.start();

  const shutdown = () => {
    void sdk.shutdown().catch(() => undefined);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  console.log(
    `OpenTelemetry tracing enabled service=${serviceName} endpoint=${tracesUrl}`,
  );
}
