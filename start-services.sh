#!/bin/bash
# Entrypoint for the combined Redis + Solr image.
# Starts Redis in the background and Solr in the foreground. If either process
# exits, both are shut down so the container stops cleanly.
set -euo pipefail

REDIS_PID=""
SOLR_PID=""

shutdown() {
  echo "[entrypoint] Caught signal / child exit — shutting down services..."
  [ -n "$SOLR_PID" ]  && kill "$SOLR_PID"  2>/dev/null || true
  [ -n "$REDIS_PID" ] && kill "$REDIS_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  exit 0
}
trap shutdown SIGTERM SIGINT

echo "[entrypoint] Starting Redis on port ${REDIS_PORT}..."
redis-server \
  --port "${REDIS_PORT}" \
  --dir "${REDIS_DATA_DIR}" \
  --daemonize no &
REDIS_PID=$!

echo "[entrypoint] Starting Solr on port ${SOLR_PORT}..."
"${SOLR_BIN:-/opt/solr/bin/solr}" start -p "${SOLR_PORT}" -f &
SOLR_PID=$!

# Wait for whichever service exits first, then tear everything down.
wait -n
shutdown
