# Roomly — інформаційна система мережі готелів

Навчальний монорепозиторій: мало фіч, чіткі межі сервісів.

## Команда

| Хто | Роль | Зона |
|---|---|---|
| **Vlad** | Backend (NestJS) | Gateway, User, Notification |
| **Vitalii** | Backend (Python) | Hotel, Booking |
| **Roman** | Frontend | `frontend/` |

Спільно: `infra/`, кореневі scripts.

## Структура

```text
roomly/
├── frontend/                      # Roman
├── backend/
│   ├── js/                        # NestJS monorepo · Vlad
│   │   ├── apps/
│   │   │   ├── gateway/           # :3000
│   │   │   ├── user-service/      # :3001
│   │   │   └── notification-service/  # :3002
│   │   └── libs/common/           # @roomly/common
│   └── python/                    # Vitalii
│       ├── hotel-service/         # каталог + availability/reserve
│       └── booking-service/
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── .env.example
│   ├── postgres/init/ + postgres/data/
│   ├── redis/data/
│   └── rabbitmq/data/
├── scripts/
│   └── roomly.mjs                 # CLI (npm run up / dev / …)
├── package.json                   # кореневі npm scripts
└── .github/workflows/
```

## Сервіси та owners

| Сервіс | Стек | БД | Відповідальність | Owner |
|---|---|---|---|---|
| **API Gateway** | NestJS | — | HTTP/WS вхід, JWT, routing | Vlad |
| **User** | NestJS | `user_db` | реєстрація, логін, сесії, ролі | Vlad |
| **Notification** | NestJS | — | споживач подій → email/log | Vlad |
| **Hotel** | Python | `hotel_db` | готелі, номери, availability, reserve/release | Vitalii |
| **Booking** | Python | `booking_db` | життєвий цикл бронювання | Vitalii |
| **Frontend** | — | — | UI | Roman |

Hotel = колишні Hotel + Inventory в одному сервісі.

## Комунікація

- **Sync:** HTTP між сервісами (без gRPC)
- **Async:** RabbitMQ → Notification (і опційно WS через Gateway)
- **Зовнішній API:** лише через Gateway

```text
Client → Gateway → Booking
                     │ HTTP POST /internal/reserve
                     ▼
                   Hotel (atomic reserve / CONFLICT)
                     │
                     ▼
              event → RabbitMQ → Notification
```

## Зони в репо

| Зона | Owner |
|---|---|
| `backend/js/apps/{gateway,user-service,notification-service}` | Vlad |
| `backend/python/**` | Vitalii |
| `frontend/` | Roman |
| `infra/`, scripts | спільно |

Compose і env: `infra/docker-compose*.yml`, `infra/.env`.

## Локальний запуск

Потрібні: **Node.js**, **Docker**.

```bash
npm run up            # infra + gateway + user + notification
npm run dev           # те саме, але з nest --watch
npm run infra         # лише postgres, redis, rabbitmq
npm run down
```

Деталі: `npm run roomly -- help` (або `node scripts/roomly.mjs help`).

Compose / env: `infra/`.
