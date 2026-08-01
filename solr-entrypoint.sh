#!/bin/bash
set -e

SOLR_BIN="/xbiom/apps/solr/solr/bin/solr"
ZK_HOST="apache-ranger-zk:2181"
SECURITY_FILE="/xbiom/data/solr/data/security.json"

echo "[startup] Waiting for ZooKeeper..."

until "$SOLR_BIN" zk ls / -z "$ZK_HOST" >/dev/null 2>&1; do
    sleep 2
done

echo "[startup] ZooKeeper is available."

# Check whether /security.json already exists
if "$SOLR_BIN" zk ls / -z "$ZK_HOST" 2>/dev/null | grep -qx "security.json"; then
    echo "[startup] /security.json already exists in ZooKeeper."
else
    echo "[startup] Uploading security.json to ZooKeeper..."

    "$SOLR_BIN" zk cp \
        "file:$SECURITY_FILE" \
        "zk:/security.json" \
        -z "$ZK_HOST"

    echo "[startup] security.json uploaded successfully."
fi

echo "[startup] Starting SolrCloud..."

exec "$SOLR_BIN" start \
    -c \
    -p 8090 \
    -z "$ZK_HOST" \
    -f