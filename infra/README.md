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
  grafana/
    provisioning/  # datasources (Loki + Jaeger)
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
| Grafana | http://localhost:3003 | Loki (default) + Jaeger; anonymous Viewer |
| Jaeger | http://localhost:16686 | traces (also as Grafana datasource) |
| Loki | http://localhost:3100 | API only |

Flow: Nest JSON stdout → Docker logs → **Promtail** → **Loki** → **Grafana Explore**.

For Promtail JSON parsing, keep `LOG_PRETTY` unset/false in `infra/.env` when apps run in compose.

Скинути дані Postgres/Redis/RabbitMQ (і за потреби Loki/Grafana):

```bash
npm run down
rm -rf postgres/data/pgdata redis/data/* rabbitmq/data/* loki/data/* grafana/data/*   # з каталогу infra/
npm run infra
```
