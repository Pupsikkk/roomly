#!/bin/sh
set -eu

if [ -z "${APP:-}" ]; then
  echo "APP is required (gateway | user-service | notification-service | user-migrate)"
  exit 1
fi

if [ "$APP" = "user-migrate" ]; then
  echo "→ running user_db migrations"
  exec ./node_modules/.bin/typeorm migration:run \
    -d dist-migrate/apps/user-service/src/adapters/outbound/persistence/typeorm/data-source.js
fi

ENTRY="dist/apps/${APP}/main.js"

if [ ! -f "$ENTRY" ]; then
  echo "Unknown APP='${APP}'. Expected one of: gateway, user-service, notification-service, user-migrate"
  echo "Missing file: ${ENTRY}"
  exit 1
fi

exec node "$ENTRY"
