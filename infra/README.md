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
  loki/            # config + data/
  promtail/        # scrape config (Docker SD → Loki)
  prometheus/      # scrape Nest /metrics + data/
  grafana/
    provisioning/  # datasources (Loki + Jaeger + Prometheus)
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
| Grafana | http://localhost:3003 | Loki + Jaeger + Prometheus; folder **Roomly** |
| Jaeger | http://localhost:16686 | traces (also as Grafana datasource) |
| Loki | http://localhost:3100 | API only |
| Prometheus | http://localhost:9090 | metrics UI / targets |

Flow:
- Logs: Nest JSON stdout → Docker → **Promtail** → **Loki** → Grafana
- Traces: Nest OTLP → **Jaeger** → Grafana
- App metrics: Nest `/metrics` (OTel) → **Prometheus** → Grafana
- Infra metrics: **redis_exporter** / **postgres_exporter** / RabbitMQ prometheus plugin → Prometheus → community dashboards

**OTel vs community dashboards:** Nest OTel (`http_server_*`, runtime) does **not** power Redis/Postgres/RabbitMQ community dashboards — those need exporter metrics (`redis_*`, `pg_*`, `rabbitmq_*`). Same Prometheus scrapes both.

Provisioned dashboards (folder Roomly): Nest (OTel), Logs & Traces (Loki + Jaeger), Redis, PostgreSQL, RabbitMQ Overview.

**Error detection (minimum):** Grafana Alerting rules in folder Roomly — `Nest HTTP 5xx` (Prometheus) and `Nest error logs` (Loki). Open **Alerting → Alert rules**; Firing state is enough locally (no Slack/SMTP). Unexpected Nest exceptions are logged via `UnhandledExceptionFilter` (+ domain warns in user-service).

For Promtail JSON parsing, keep `LOG_PRETTY` unset/false in `infra/.env` when apps run in compose.

Скинути дані Postgres/Redis/RabbitMQ (і за потреби Loki/Grafana/Prometheus):

```bash
npm run down
rm -rf postgres/data/pgdata redis/data/* rabbitmq/data/* loki/data/* grafana/data/* prometheus/data/*   # з каталогу infra/
npm run infra
```
