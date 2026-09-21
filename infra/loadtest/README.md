# k6 load tests against Roomly gateway (via gateway-lb).

## Run once (stack must be up)

```bash
npm run loadtest
```

Optional env (in shell or `infra/secrets/.env`):

| Var | Default | Meaning |
|-----|---------|---------|
| `LOADTEST_VUS` | `10` | concurrent virtual users |
| `LOADTEST_DURATION` | `30s` | how long to generate traffic |
| `LOADTEST_BASE_URL` | `http://gateway-lb` | target inside Docker network |
| `LOADTEST_PASSWORD` | `Test1234!` | password for synthetic users |

## With `services.conf`

```conf
loadtest=1
# or loadtest=5  → 5 VUs if LOADTEST_VUS is not set in .env
```

`npm run up` / `npm run dev` start k6 once (waits for gateway `/health`, then runs).
Container exits when `LOADTEST_DURATION` ends. Re-run with `npm run loadtest`.

## Script

`gateway.js` — per VU: sign-up → sign-in → several `GET /users/me` + `/health`.
