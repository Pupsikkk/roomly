# Scripts

Кросплатформенний CLI на Node (`.mjs`) — Win / Mac / Linux.

```bash
npm run up            # core + obs + Nest
npm run dev           # hot-reload
npm run auth:keys     # local JWT RSA private key (once)
npm run infra         # postgres / redis / rabbitmq
npm run obs           # observability stack
npm run down
npm run logs -- gateway
npm run ps
npm run roomly -- help
```

Або напряму:

```bash
node scripts/roomly.mjs up
```

Compose / secrets: `infra/docker/docker-compose*.yml`, `infra/secrets/.env`.
