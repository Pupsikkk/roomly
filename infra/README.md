# Infrastructure for Roomly

```text
infra/
  docker-compose.yml
  docker-compose.dev.yml
  .env.example / .env
  postgres/
    init/          # CREATE DATABASE ...
    data/          # bind mount; DB files in data/pgdata/
  redis/data/
  rabbitmq/data/
  loki/            # config + data/ (OTLP ingest from otel-collector)
  prometheus/      # scrape Collector :8889 + infra exporters + data/
  tempo/           # trace store (OTLP from collector; UI via Grafana)
  otel-collector/  # OTLP hop (Nest → Collector → Tempo / Loki / Prometheus)
  grafana/
    provisioning/  # datasources (Loki + Tempo + Prometheus)
    data/          # Grafana state (bind mount)
```

Дані інфри зберігаються **локально в `infra/*/data`**, не в anonymous Docker volumes.

Run from repo root:

```bash
npm run up
npm run dev
npm run infra
```

Or directly:

```bash
docker compose -f infra/docker-compose.yml up -d
```

### Observability (local)

| UI | URL | Notes |
|---|---|---|
| Grafana | http://localhost:3003 | Loki + Tempo + Prometheus; folder **Roomly** |
| Tempo | http://localhost:3200 | traces API (Explore → Tempo in Grafana) |
| OTEL Collector | localhost:4318 (HTTP) / :4317 (gRPC) / :8889 (Prom) | apps send OTLP; Prometheus scrapes :8889 |
| Loki | http://localhost:3100 | API only |
| Prometheus | http://localhost:9090 | metrics UI / targets |

Flow:
- Logs: Nest OTLP logs → **OTEL Collector** → **Loki** → Grafana (`compose_service` from `service.name`; `collector.name=roomly-otel-collector`). Stdout remains for `docker compose logs` only.
- Traces: Nest OTLP → **OTEL Collector** → **Tempo** → Grafana (Trace to logs / Trace to metrics)
- App metrics: Nest OTLP → **OTEL Collector** (`:8889`) → **Prometheus** → Grafana (same `compose_service` / `collector.name` labels)
- Infra metrics: **redis_exporter** / **postgres_exporter** / RabbitMQ prometheus plugin → Prometheus → community dashboards

**OTel vs community dashboards:** Nest OTel (`http_server_*`, `v8js_*`, runtime) powers **Roomly Nest (OTel)**. Redis/Postgres/RabbitMQ community dashboards need their exporters (`redis_*`, `pg_*`, `rabbitmq_*`). Same Prometheus scrapes all.

Provisioned dashboards (folder Roomly): Nest (OTel), Logs & Traces (Loki + Tempo), Redis, PostgreSQL, RabbitMQ Overview.

**Error detection (minimum):** Grafana Alerting rules in folder Roomly — `Nest HTTP 5xx` (Prometheus) and `Nest error logs` (Loki). Open **Alerting → Alert rules**; Firing state is enough locally (no Slack/SMTP). Unexpected Nest exceptions are logged via `UnhandledExceptionFilter` (+ domain warns in user-service).

Disable OTLP log export with `OTEL_LOGS_EXPORTER=none` if needed. `LOG_PRETTY=true` skips OTLP (pretty worker transport).

Скинути дані Postgres/Redis/RabbitMQ (і за потреби Loki/Grafana/Prometheus):

```bash
npm run down
rm -rf postgres/data/pgdata redis/data/* rabbitmq/data/* loki/data/* grafana/data/* prometheus/data/*   # з каталогу infra/
npm run infra
```
