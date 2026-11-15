#!/usr/bin/env bash
# Runs ON THE AWS SERVER (sent over SSH by Jenkins).
# Usage: remote-deploy.sh <image> <version>
set -euo pipefail

IMAGE="${1:?Usage: remote-deploy.sh <image> <version>}"
VERSION="${2:?Usage: remote-deploy.sh <image> <version>}"
CONTAINER="calculator"

echo "==> Server: $(hostname)"

# 1. Pull first: if this fails, the old version keeps running
echo "==> Pulling ${IMAGE}"
docker pull "${IMAGE}"

CURRENT=$(docker inspect --format '{{.Config.Image}}' "${CONTAINER}" 2>/dev/null || echo "none")
echo "==> Currently running: ${CURRENT}"

# 2. Replace the container
docker rm -f "${CONTAINER}" > /dev/null 2>&1 || true
docker run -d \
  --name "${CONTAINER}" \
  --restart unless-stopped \
  -p 80:3000 \
  "${IMAGE}" > /dev/null

# 3. Wait until the new version answers on port 80
for i in $(seq 1 15); do
  if curl -fs http://localhost/health | grep -q "\"version\":\"${VERSION}\""; then
    echo "==> SUCCESS: ${IMAGE} is live"
    docker image prune -f > /dev/null
    exit 0
  fi
  echo "    waiting for app... (${i}/15)"
  sleep 2
done

echo "ERROR: ${IMAGE} did not become healthy"
docker logs --tail 50 "${CONTAINER}" || true
exit 1