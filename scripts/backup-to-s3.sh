#!/usr/bin/env bash
# Dump every app database from the Postgres container and stream gzip'd SQL to S3.
#
# Runs on the host (EC2). Designed for an IAM instance role — the host `aws` CLI
# picks up temporary credentials automatically, so no static keys are needed.
# Videos already live in S3; this covers the only un-backed-up data (Postgres).
#
# Usage:   scripts/backup-to-s3.sh
# Cron:    0 18 * * *  /home/ubuntu/lang/scripts/backup-to-s3.sh >> /home/ubuntu/lang/backup.log 2>&1
set -euo pipefail

PG_CONTAINER="${PG_CONTAINER:-lang-postgres-1}"
S3_PREFIX="backups/postgres"
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"

# Read only the vars we need from .env (values stay on the host, never uploaded).
getenv() { grep -E "^$1=" "$ENV_FILE" | head -n1 | cut -d= -f2-; }
POSTGRES_USER="$(getenv POSTGRES_USER)"
POSTGRES_PASSWORD="$(getenv POSTGRES_PASSWORD)"
S3_BUCKET="$(getenv S3_BUCKET)"
export AWS_DEFAULT_REGION="$(getenv AWS_REGION)"
: "${AWS_DEFAULT_REGION:=ap-northeast-1}"

if [ -z "$S3_BUCKET" ]; then
  echo "ERROR: S3_BUCKET not found in $ENV_FILE" >&2
  exit 1
fi

TS="$(date -u +%Y%m%dT%H%M%SZ)"

# Discover all non-template databases (langlearn, langlearn_en, ...).
mapfile -t DBS < <(docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$PG_CONTAINER" \
  psql -U "$POSTGRES_USER" -d postgres -tAc \
  "SELECT datname FROM pg_database WHERE datistemplate = false AND datname <> 'postgres'")

for DB in "${DBS[@]}"; do
  [ -z "$DB" ] && continue
  KEY="s3://${S3_BUCKET}/${S3_PREFIX}/${DB}/${DB}_${TS}.sql.gz"
  echo "[$(date -u +%FT%TZ)] backing up ${DB} -> ${KEY}"
  # pipefail aborts the whole pipeline if pg_dump fails, so no truncated upload.
  docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$PG_CONTAINER" \
    pg_dump -U "$POSTGRES_USER" -d "$DB" --no-owner --clean --if-exists \
    | gzip \
    | aws s3 cp - "$KEY"
done

echo "[$(date -u +%FT%TZ)] backup complete: ${#DBS[@]} database(s)"
