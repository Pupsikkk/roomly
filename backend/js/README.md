# Backend · NestJS monorepo

Зона **Vlad**: **gateway**, **user-service**, **notification-service**.

```text
apps/
  gateway/                 # :3000
  user-service/            # :3001 · hex (domain / application / adapters)
  notification-service/    # :3002
libs/
  common/src/              # @roomly/common — config, health, constants
  infra/src/               # @roomly/infra — connect helpers
  contracts/src/           # @roomly/contracts — events + HTTP shapes
    db/
    redis/
    rabbit/
```

## Commands

```bash
npm install

# watch (окремі термінали)
npm run start:dev:gateway
npm run start:dev:user
npm run start:dev:notification

# build all
npm run build
```

## Docker

**Prod** (збірка `dist` у image — без watch):

```bash
docker compose -f infra/docker-compose.yml up --build gateway user-service notification-service
```

**Dev / watch** (код з хоста монтується, `nest --watch`):

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.dev.yml up --build gateway user-service notification-service
```

Або з кореня: `npm run up` / `npm run dev`.

Образ `roomly-js:local` / `roomly-js:dev`. Який ап стартує — через `APP` у compose.

| Сервіс | `APP` | порт |
|---|---|---|
| gateway | `gateway` | 3000 |
| user-service | `user-service` | 3001 |
| notification-service | `notification-service` | 3002 |

## Env

Конфіг у `infra/.env` (див. `infra/.env.example`):

- порти: `GATEWAY_PORT`, `USER_SERVICE_PORT`, `NOTIFICATION_SERVICE_PORT`
- БД: `USER_DB_NAME`, `POSTGRES_HOST`, `POSTGRES_USER`, …
- у коді: `RoomlyConfigModule.forRoot({ load: ['services', 'auth', ...] })`
  namespaces: `postgres` | `redis` | `rabbitmq` | `services` | `auth`

Init SQL (`infra/postgres/init/`) хардкодить імена БД — вони мають збігатися з `infra/.env`.

Hotel / Booking — у `backend/python/`. Sync між сервісами — HTTP, події — RabbitMQ.
