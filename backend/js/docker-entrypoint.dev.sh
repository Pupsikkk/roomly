#!/bin/sh
set -e
# Named volume for node_modules outlives image rebuilds.
# Re-run npm ci when package-lock.json changes.
LOCK_HASH="$(sha256sum package-lock.json | awk '{print $1}')"
STAMP="node_modules/.roomly-deps-hash"
if [ ! -f "$STAMP" ] || [ "$(cat "$STAMP")" != "$LOCK_HASH" ]; then
  echo "→ syncing node_modules (package-lock changed or empty volume)"
  npm ci
  mkdir -p node_modules
  echo "$LOCK_HASH" > "$STAMP"
fi
exec "$@"
