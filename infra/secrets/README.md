# Local secrets (dev)

| Path | Purpose |
|------|---------|
| `.env.example` | Template (committed) |
| `.env` | Local compose / Nest env (**gitignored**) |
| `dev/jwt-private.pem` | JWT signing key for user-service (**gitignored**) |

Copy env once (also auto-created by `npm run up` / `dev` / `infra` / `obs`):

```bash
cp infra/secrets/.env.example infra/secrets/.env
```

JWT key:

```bash
npm run auth:keys
```

See `dev/README.md` for JWT details.
