# Scripts

Кросплатформенний CLI на Node (`.mjs`) — Win / Mac / Linux.

```bash
npm run up            # infra + Nest services
npm run dev           # hot-reload
npm run auth:keys     # local JWT RSA private key (once)
npm run infra         # лише postgres / redis / rabbitmq
npm run down
npm run logs -- gateway
npm run ps
npm run roomly -- help
```

Або напряму:

```bash
node scripts/roomly.mjs up
```

Compose / env: `infra/docker-compose.yml`, `infra/.env`.
