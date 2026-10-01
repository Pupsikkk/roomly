# Backend · Python

Зона **Vitalii**:

```text
hotel-service/     # готелі, номери + availability / atomic reserve
booking-service/   # створення, скасування, історія бронювань
```

Спілкування з Nest-сервісами — через **HTTP** (і події в RabbitMQ).

## hotel-service

Увімкнено в `infra/docker/services.conf` (`hotel-service=1`).

```bash
npm run up          # prod image + alembic + uvicorn
npm run dev         # bind-mount + --reload
```

Swagger: http://localhost:8000/docs · health: `/health`

## booking-service

Увімкнено в `infra/docker/services.conf` (`booking-service=1`). Залежить від `hotel-service`.

Swagger: http://localhost:8001/docs · health: `/health`
