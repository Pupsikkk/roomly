# Infrastructure for Roomly

```text
infra/
  docker/
    docker-compose.yml       # postgres, redis, rabbitmq + Nest apps
    docker-compose.obs.yml   # Tempo, Loki, Collector, Prometheus, Grafana + exporters
    docker-compose.dev.yml   # Nest hot-reload overlay
    services.conf            # 0=off, N=replicas (used by npm run up / dev)
  secrets/
    .env.example / .env      # compose + app env (gitignored .env)
    dev/                     # JWT PEM (gitignored)
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

Relative paths у compose (`./postgres`, `./secrets`, …) резолвляться від `infra/` через `--project-directory`.

Профіль запуску: `infra/docker/services.conf` (`0` = вимкнено, `N` = кількість реплік; `obs` — група 0/1).

```bash
# приклад
obs=1
postgres=1
redis=0
gateway=1
notification-service=0
```

Run from repo root:

```bash
npm run up          # core + obs + apps
npm run dev         # same + Nest watch
npm run infra       # postgres / redis / rabbitmq
npm run obs         # observability stack only
```

Or directly:

```bash
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.obs.yml \
  --env-file infra/secrets/.env --project-directory infra up -d
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
- App metrics: Nest OTLP → **OTEL Collector** (`:8889`) → **Prometheus** → Grafana
- Infra metrics: **redis_exporter** / **postgres_exporter** / RabbitMQ prometheus plugin → Prometheus → community dashboards

**OTel vs community dashboards:** Nest OTel (`http_server_*`, `v8js_*`, runtime) powers **Roomly Nest (OTel)**. Redis/Postgres/RabbitMQ community dashboards need their exporters (`redis_*`, `pg_*`, `rabbitmq_*`). Same Prometheus scrapes all.

Provisioned dashboards (folder Roomly): Nest (OTel), Logs & Traces (Loki + Tempo), Redis, PostgreSQL, RabbitMQ Overview.

**Error detection (minimum):** Grafana Alerting rules in folder Roomly — `Nest HTTP 5xx` (Prometheus) and `Nest error logs` (Loki). Open **Alerting → Alert rules**; Firing state is enough locally (no Slack/SMTP). Unexpected Nest exceptions are logged via `UnhandledExceptionFilter` (+ domain warns in user-service).

Disable OTLP log export with `OTEL_LOGS_EXPORTER=none` if needed. `LOG_PRETTY=true` skips OTLP (pretty worker transport).

Скинути дані Postgres/Redis/RabbitMQ (і за потреби Loki/Grafana/Prometheus/Tempo):

```bash
npm run down
rm -rf postgres/data/pgdata redis/data/* rabbitmq/data/* loki/data/* grafana/data/* prometheus/data/* tempo/data/*   # з каталогу infra/
npm run infra && npm run obs
```
