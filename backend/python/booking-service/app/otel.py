"""Optional OpenTelemetry bootstrap — soft-fail, never blocks app startup.

Signals (same env gates as Nest):
  - traces:  OTEL_EXPORTER_OTLP_ENDPOINT set
  - logs:    endpoint + OTEL_LOGS_EXPORTER not none/false (stdlib → OTLP → Loki)
  - metrics: endpoint + OTEL_METRICS_DISABLED not true (system/process + OTLP)

Missing packages, setup errors, or a down collector must not prevent uvicorn from running.
"""

from __future__ import annotations

import json
import logging
import os
import sys
import time
from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from fastapi import FastAPI
    from sqlalchemy.ext.asyncio import AsyncEngine

_started = False
_logs_on = False
_service_name = ""
_logger_provider: Any = None

_ACCESS_SKIP_PATHS = frozenset(
    {"/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico"},
)


def _flag_on(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def _disabled() -> bool:
    return _flag_on(os.getenv("OTEL_SDK_DISABLED"))


def _endpoint() -> str:
    return (os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT") or "").strip().rstrip("/")


def _signal_url(endpoint: str, signal: str) -> str:
    suffix = f"/v1/{signal}"
    return endpoint if endpoint.endswith(suffix) else f"{endpoint}{suffix}"


def _logs_enabled(endpoint: str) -> bool:
    if not endpoint:
        return False
    v = (os.getenv("OTEL_LOGS_EXPORTER") or "otlp").strip().lower()
    return v not in {"none", "false", "0", "off"}


def _metrics_enabled(endpoint: str) -> bool:
    return bool(endpoint) and not _flag_on(os.getenv("OTEL_METRICS_DISABLED"))


def _attach_otlp_log_handlers() -> None:
    """Attach OTLP LoggingHandler to loggers uvicorn isolates (propagate=False)."""
    if _logger_provider is None:
        return
    try:
        from opentelemetry.sdk._logs import LoggingHandler
    except ImportError:
        return

    for name in ("", "uvicorn", "uvicorn.access", "uvicorn.error"):
        logger = logging.getLogger(name)
        if any(isinstance(h, LoggingHandler) for h in logger.handlers):
            continue
        # One handler instance per logger — shared handlers can drop records.
        logger.addHandler(
            LoggingHandler(level=logging.NOTSET, logger_provider=_logger_provider),
        )
        if name.startswith("uvicorn"):
            logger.propagate = False


def _emit_access_log(payload: dict[str, Any]) -> None:
    """Emit Nest-style JSON body via OTel Logs API (same idea as pino-otel-stream)."""
    line = json.dumps(payload, separators=(",", ":"))
    # Always keep a stdout breadcrumb for docker compose logs.
    print(line, flush=True)
    try:
        from opentelemetry._logs import SeverityNumber, get_logger

        get_logger("roomly.access").emit(
            body=line,
            severity_number=SeverityNumber.INFO,
            severity_text="INFO",
            attributes={
                "req_method": str(payload.get("req_method", "")),
                "req_url": str(payload.get("req_url", "")),
                "res_statusCode": int(payload.get("res_statusCode") or 0),
            },
        )
    except Exception:  # noqa: BLE001
        logging.getLogger("roomly.access").info("%s", line)


def setup_otel(default_service_name: str) -> bool:
    """Configure traces / logs / metrics when OTLP endpoint is set. Returns True if any active."""
    global _started, _logs_on, _service_name, _logger_provider
    if _started:
        return True
    if _disabled():
        return False
    endpoint = _endpoint()
    traces_on = bool(endpoint)
    logs_on = _logs_enabled(endpoint)
    metrics_on = _metrics_enabled(endpoint)
    if not traces_on and not logs_on and not metrics_on:
        return False

    try:
        from opentelemetry.sdk.resources import Resource
    except ImportError as exc:
        print(f"otel: packages missing, skip ({exc})", file=sys.stderr)
        return False

    _service_name = (
        (os.getenv("OTEL_SERVICE_NAME") or "").strip() or default_service_name
    )
    resource = Resource.create({"service.name": _service_name})
    enabled: list[str] = []

    try:
        if traces_on:
            from opentelemetry import trace
            from opentelemetry.exporter.otlp.proto.http.trace_exporter import (
                OTLPSpanExporter,
            )
            from opentelemetry.sdk.trace import TracerProvider
            from opentelemetry.sdk.trace.export import BatchSpanProcessor

            provider = TracerProvider(resource=resource)
            traces_url = _signal_url(endpoint, "traces")
            provider.add_span_processor(
                BatchSpanProcessor(OTLPSpanExporter(endpoint=traces_url)),
            )
            trace.set_tracer_provider(provider)
            enabled.append(f"traces={traces_url}")

        if logs_on:
            from opentelemetry._logs import set_logger_provider
            from opentelemetry.exporter.otlp.proto.http._log_exporter import (
                OTLPLogExporter,
            )
            from opentelemetry.sdk._logs import LoggerProvider
            from opentelemetry.sdk._logs.export import BatchLogRecordProcessor

            logs_url = _signal_url(endpoint, "logs")
            logger_provider = LoggerProvider(resource=resource)
            logger_provider.add_log_record_processor(
                BatchLogRecordProcessor(OTLPLogExporter(endpoint=logs_url)),
            )
            set_logger_provider(logger_provider)
            _logger_provider = logger_provider
            _logs_on = True
            _attach_otlp_log_handlers()
            try:
                from opentelemetry.instrumentation.logging import LoggingInstrumentor

                LoggingInstrumentor().instrument(set_logging_format=False)
            except Exception as exc:  # noqa: BLE001
                print(f"otel: logging instrument skipped ({exc})", file=sys.stderr)
            enabled.append(f"logs={logs_url}")

        if metrics_on:
            from opentelemetry import metrics
            from opentelemetry.exporter.otlp.proto.http.metric_exporter import (
                OTLPMetricExporter,
            )
            from opentelemetry.sdk.metrics import MeterProvider
            from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader

            metrics_url = _signal_url(endpoint, "metrics")
            interval = int(os.getenv("OTEL_METRIC_EXPORT_INTERVAL") or "15000")
            reader = PeriodicExportingMetricReader(
                OTLPMetricExporter(endpoint=metrics_url),
                export_interval_millis=interval if interval > 0 else 15_000,
            )
            metrics.set_meter_provider(
                MeterProvider(resource=resource, metric_readers=[reader]),
            )
            try:
                from opentelemetry.instrumentation.system_metrics import (
                    SystemMetricsInstrumentor,
                )

                SystemMetricsInstrumentor().instrument()
            except Exception as exc:  # noqa: BLE001
                print(f"otel: system metrics skipped ({exc})", file=sys.stderr)
            enabled.append(f"metrics={metrics_url}")

        if not enabled:
            return False

        _started = True
        print(
            f"otel: enabled service={_service_name} " + " ".join(enabled),
            file=sys.stderr,
        )
        return True
    except Exception as exc:  # noqa: BLE001 — telemetry must never block boot
        print(f"otel: setup failed, continuing without telemetry ({exc})", file=sys.stderr)
        return False


def _access_log_middleware(service_name: str) -> Callable:
    """Nest-compatible JSON access lines so Grafana `| json | res_statusCode` panels work."""

    async def middleware(request: Any, call_next: Callable) -> Any:
        path = request.url.path
        if path in _ACCESS_SKIP_PATHS or path.startswith("/docs"):
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

        trace_id = ""
        span_id = ""
        try:
            from opentelemetry import trace

            span = trace.get_current_span()
            if span is not None:
                ctx = span.get_span_context()
                if ctx is not None and ctx.is_valid:
                    trace_id = format(ctx.trace_id, "032x")
                    span_id = format(ctx.span_id, "016x")
        except Exception:  # noqa: BLE001
            pass

        # Body = full JSON line (same idea as Nest pino → OTLP stream).
        _emit_access_log(
            {
                "level": 30,
                "service": service_name,
                "message": "request completed",
                "req_method": request.method,
                "req_url": path,
                "res_statusCode": response.status_code,
                "responseTime": elapsed_ms,
                "trace_id": trace_id,
                "span_id": span_id,
            },
        )
        return response

    return middleware


def instrument_app(
    app: FastAPI,
    *,
    engine: AsyncEngine | None = None,
    httpx: bool = False,
) -> None:
    """Attach FastAPI / SQLAlchemy / httpx instrumentation when setup_otel succeeded."""
    if not _started:
        return

    if _logs_on:
        # Register BEFORE FastAPIInstrumentor so this middleware sits inside the
        # server span and can read trace_id/span_id after call_next.
        app.middleware("http")(_access_log_middleware(_service_name))

        @app.on_event("startup")
        async def _otel_reattach_log_handlers() -> None:
            _attach_otlp_log_handlers()

    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

        FastAPIInstrumentor.instrument_app(
            app,
            excluded_urls="health,/docs,/openapi.json,/redoc",
            # Drop ASGI receive/send noise ("… http send") — keep the route span only.
            exclude_spans=["receive", "send"],
        )
    except Exception as exc:  # noqa: BLE001
        print(f"otel: fastapi instrument skipped ({exc})", file=sys.stderr)

    if engine is not None:
        try:
            from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

            # Instrumentor declares sqlalchemy<2.1; booking pins 2.1.x — still works.
            SQLAlchemyInstrumentor().instrument(
                engine=engine.sync_engine,
                skip_dep_check=True,
            )
        except Exception as exc:  # noqa: BLE001
            print(f"otel: sqlalchemy instrument skipped ({exc})", file=sys.stderr)

    if httpx:
        try:
            from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

            HTTPXClientInstrumentor().instrument()
        except Exception as exc:  # noqa: BLE001
            print(f"otel: httpx instrument skipped ({exc})", file=sys.stderr)


def is_enabled() -> bool:
    return _started
