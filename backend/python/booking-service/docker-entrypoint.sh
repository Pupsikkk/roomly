#!/bin/sh
set -e

PORT="${BOOKING_SERVICE_PORT:-8001}"

echo "booking-service: alembic upgrade head"
alembic upgrade head

if [ "${BOOKING_RELOAD:-0}" = "1" ]; then
  echo "booking-service: uvicorn --reload on :${PORT}"
  exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" --reload
fi

echo "booking-service: uvicorn on :${PORT}"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
