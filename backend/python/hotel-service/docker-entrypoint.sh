#!/bin/sh
set -e

PORT="${HOTEL_SERVICE_PORT:-8000}"

echo "hotel-service: alembic upgrade head"
alembic upgrade head

if [ "${HOTEL_RELOAD:-0}" = "1" ]; then
  echo "hotel-service: uvicorn --reload on :${PORT}"
  exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" --reload
fi

echo "hotel-service: uvicorn on :${PORT}"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
