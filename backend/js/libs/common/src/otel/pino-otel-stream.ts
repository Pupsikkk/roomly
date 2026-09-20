import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import type { DestinationStream } from 'pino';

/** Map pino numeric levels → OTel severity. */
function severityFromPinoLevel(level: unknown): SeverityNumber {
  const n = typeof level === 'number' ? level : Number(level);
  if (n >= 60) return SeverityNumber.FATAL;
  if (n >= 50) return SeverityNumber.ERROR;
  if (n >= 40) return SeverityNumber.WARN;
  if (n >= 30) return SeverityNumber.INFO;
  if (n >= 20) return SeverityNumber.DEBUG;
  return SeverityNumber.TRACE;
}

/**
 * Pino → OTel Logs (OTLP → Collector → Loki).
 * Body is the full pino JSON line so LogQL `| json` / HTTP tables keep working
 * without Promtail. Stdout remains for `docker compose logs` only.
 *
 * Nest `context` is copied to attribute `nest.context` so the Collector can
 * filter bootstrap noise (InstanceLoader / RoutesResolver / …).
 *
 * Uses the active context as-is (do not wrapSpanContext from log fields —
 * that replaces the recording HTTP span and breaks cross-service export).
 */
export function createPinoOtelStream(): DestinationStream {
  return {
    write(chunk: string) {
      const line = chunk.trim();
      if (!line) return;

      const otelLogger = logs.getLogger('nestjs-pino');
      let severity = SeverityNumber.INFO;
      const attributes: Record<string, string> = {};
      try {
        const rec = JSON.parse(line) as Record<string, unknown>;
        severity = severityFromPinoLevel(rec.level);
        if (typeof rec.context === 'string' && rec.context.length > 0) {
          attributes['nest.context'] = rec.context;
        }
      } catch {
        // non-JSON line — still forward as body
      }

      otelLogger.emit({
        body: line,
        severityNumber: severity,
        ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
      });
    },
  };
}
