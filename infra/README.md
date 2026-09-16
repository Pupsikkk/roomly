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

Скинути дані Postgres/Redis/RabbitMQ:

```bash
npm run down
rm -rf postgres/data/pgdata redis/data/* rabbitmq/data/*   # з каталогу infra/
npm run infra
```
