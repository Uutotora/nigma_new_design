#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE_HOST="root@e-vityazev.ru"
REMOTE_PATH="/var/www/nigma_new_design"

cd "$ROOT_DIR"

export BUILD_BASE_PATH="nigma_new_design"

echo "Building project for VPS deployment with base path: /${BUILD_BASE_PATH}/"
npm run build

echo "Ensuring remote directory exists: ${REMOTE_HOST}:${REMOTE_PATH}"
ssh "$REMOTE_HOST" "mkdir -p '$REMOTE_PATH'"

echo "Uploading dist/spa contents to ${REMOTE_HOST}:${REMOTE_PATH}"
rsync -av --delete dist/spa/ "${REMOTE_HOST}:${REMOTE_PATH}/"

echo "Deployment finished. index.html is available at ${REMOTE_PATH}/index.html"
