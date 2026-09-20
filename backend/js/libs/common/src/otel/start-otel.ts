import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HostMetrics } from '@opentelemetry/host-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
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
    path === '/json/version' ||
    path.startsWith('/docs')
  );
}

function otlpSignalUrl(
  endpoint: string,
  signal: 'traces' | 'logs' | 'metrics',
): string {
  const suffix = `/v1/${signal}`;
  return endpoint.endsWith(suffix) ? endpoint : `${endpoint}${suffix}`;
}

/**
 * OpenTelemetry: traces + logs + metrics → OTLP Collector.
 * Import apps/<service>/src/otel.ts first in main.ts (side effect).
 *
 * - Traces/logs/metrics: require OTEL_EXPORTER_OTLP_ENDPOINT (compose: otel-collector:4318)
 * - Logs: OTEL_LOGS_EXPORTER=otlp (default); disable with none/false
 * - Metrics: on by default when endpoint set; disable with OTEL_METRICS_DISABLED=true
 * - Entire SDK: OTEL_SDK_DISABLED=true
 * - Stdout / LOG_PRETTY unchanged (dual-write with OTLP logs)
 */
export function startOtel(serviceName: string): void {
  if (started) return;
  if (process.env.OTEL_SDK_DISABLED === 'true') return;

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.replace(/\/$/, '');
  const tracesEnabled = Boolean(endpoint);
  const logsExporter = (process.env.OTEL_LOGS_EXPORTER ?? 'otlp').toLowerCase();
  const logsEnabled =
    Boolean(endpoint) &&
    logsExporter !== 'none' &&
    logsExporter !== 'false';
  const metricsEnabled =
    Boolean(endpoint) && process.env.OTEL_METRICS_DISABLED !== 'true';
  if (!tracesEnabled && !metricsEnabled && !logsEnabled) return;

  started = true;

  if (process.env.OTEL_LOG_LEVEL === 'debug') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const resolvedName =
    process.env.OTEL_SERVICE_NAME?.trim() || serviceName;

  const metricReaders = [];
  if (metricsEnabled) {
    const exportIntervalMillis = Number(
      process.env.OTEL_METRIC_EXPORT_INTERVAL ?? 15_000,
    );
    metricReaders.push(
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: otlpSignalUrl(endpoint!, 'metrics'),
        }),
        exportIntervalMillis: Number.isFinite(exportIntervalMillis)
          ? exportIntervalMillis
          : 15_000,
      }),
    );
  }

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: resolvedName,
    }),
    ...(tracesEnabled
      ? {
          traceExporter: new OTLPTraceExporter({
            url: otlpSignalUrl(endpoint!, 'traces'),
          }),
        }
      : {}),
    ...(logsEnabled
      ? {
          logRecordProcessors: [
            new BatchLogRecordProcessor({
              exporter: new OTLPLogExporter({
                url: otlpSignalUrl(endpoint!, 'logs'),
              }),
            }),
          ],
        }
      : {}),
    ...(metricReaders.length > 0 ? { metricReaders } : {}),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
        // Log sending: createRoomlyLoggerModule dual-writes via pino multistream
        // (instrumentation-pino does not hook nestjs-pino under Nest webpack).
        '@opentelemetry/instrumentation-pino': { enabled: false },
        // NestJS 11 / Express 5: router pkg duplicates express and emits
        // "middleware - patched" junk.
        '@opentelemetry/instrumentation-router': { enabled: false },
        // Express 5 + swagger-ui use /*splat catch-alls; express instrumentation
        // renames root spans to "GET {/*splat}{/*splat}" and hides real paths.
        '@opentelemetry/instrumentation-express': { enabled: false },
        // nestjs-core wraps every handler twice: `Controller.method` (request_context)
        // and bare `method` (handler). Drop both; HTTP route + @Traced cover the tree.
        '@opentelemetry/instrumentation-nestjs-core': { enabled: false },
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

  if (metricsEnabled) {
    // CPU / memory / process gauges alongside HTTP RED from instrumentation-http.
    new HostMetrics().start();
  }

  const shutdown = () => {
    void sdk.shutdown().catch(() => undefined);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  const tracesUrl = tracesEnabled
    ? otlpSignalUrl(endpoint!, 'traces')
    : undefined;
  const logsUrl = logsEnabled ? otlpSignalUrl(endpoint!, 'logs') : undefined;
  const metricsUrl = metricsEnabled
    ? otlpSignalUrl(endpoint!, 'metrics')
    : undefined;
  console.log(
    `OpenTelemetry enabled service=${resolvedName}` +
      (tracesUrl ? ` traces=${tracesUrl}` : ' traces=off') +
      (logsUrl ? ` logs=${logsUrl}` : ' logs=off') +
      (metricsUrl ? ` metrics=${metricsUrl}` : ' metrics=off'),
  );
}
