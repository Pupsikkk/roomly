#!/bin/sh
set -eu

if [ -z "${APP:-}" ]; then
  echo "APP is required (gateway | user-service | notification-service)"
  exit 1
fi

ENTRY="dist/apps/${APP}/main.js"

if [ ! -f "$ENTRY" ]; then
  echo "Unknown APP='${APP}'. Expected one of: gateway, user-service, notification-service"
  echo "Missing file: ${ENTRY}"
  exit 1
fi

exec node "$ENTRY"
