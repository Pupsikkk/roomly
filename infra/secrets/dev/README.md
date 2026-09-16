# Dev JWT RSA private key (local only)

`jwt-private.pem` is used **only by user-service** to sign access tokens (RS256).
The public key is derived at runtime and exposed via JWKS
(`GET /.well-known/jwks.json`) — do not commit a public PEM.

**Never commit `*.pem`** (see root `.gitignore`).

Generate once (also runs automatically on `npm run up` / `npm run dev`):

```bash
npm run auth:keys
# force regenerate:
npm run auth:keys -- --force
```

Production: mount a real secret and set `JWT_PRIVATE_KEY_PATH` (do not reuse this file).
