#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

npm ci
npm run docker:up

server_status=0
npm run dev || server_status=$?
npm run docker:down

exit "$server_status"
