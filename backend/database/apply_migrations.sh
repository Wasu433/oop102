#!/usr/bin/env bash
set -euo pipefail

# Load .env if present
if [ -f .env ]; then
  set -o allexport
  # shellcheck disable=SC1091
  source .env
  set +o allexport
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-postgres}

echo "Starting containers..."
docker-compose up -d

echo "Waiting for Postgres to be ready..."
# wait until pg_isready inside the db container succeeds
until docker-compose exec -T db pg_isready -U "$DB_USER" >/dev/null 2>&1; do
  sleep 1
done

echo "Applying migrations..."
for f in ./migrations/*.sql; do
  # ข้าม rollback files
  [[ "$(basename "$f")" == rollback_* ]] && continue
  echo "Applying $f"
  docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -f "/migrations/$(basename "$f")"
done

echo "Migrations applied."
