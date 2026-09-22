#!/usr/bin/env bash
set -euo pipefail

project_name="sidecause-smoke-$$"

cleanup() {
  docker compose -p "$project_name" down --volumes --remove-orphans
}

trap cleanup EXIT

docker compose config --quiet
docker compose -p "$project_name" up --detach --wait postgres minio

postgres_result="$(docker compose -p "$project_name" exec -T postgres \
  psql --username=sidecause --dbname=sidecause --tuples-only --no-align \
  --command 'SELECT 1')"
test "$postgres_result" = "1"

curl --fail --silent --show-error http://127.0.0.1:9000/minio/health/live >/dev/null
