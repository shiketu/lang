#!/bin/bash
#
# 数据库备份：pg_dump 容器内的 Postgres → gzip → 上传 S3
#
# 用法（项目根目录，需先加载 .env 以拿到 POSTGRES_*/S3_*）：
#   set -a && . ./.env && set +a && ./scripts/backup-db.sh
#
# cron（每日 3:00）：
#   0 3 * * * cd ~/lang-learn && set -a && . ./.env && set +a && ./scripts/backup-db.sh >> ~/backup.log 2>&1
#
# 前置：宿主机已装 awscli；docker compose 正在运行（postgres 服务名为 postgres）
#
# 恢复：
#   aws s3 cp s3://$S3_BUCKET/backups/db-XXXX.sql.gz - \
#     | gunzip | docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

set -euo pipefail

: "${POSTGRES_USER:?POSTGRES_USER not set}"
: "${POSTGRES_DB:?POSTGRES_DB not set}"
: "${S3_BUCKET:?S3_BUCKET not set}"

STAMP=$(date +%F-%H%M%S)
TMP="/tmp/db-${STAMP}.sql.gz"

docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "$TMP"

aws s3 cp "$TMP" "s3://${S3_BUCKET}/backups/db-${STAMP}.sql.gz"

rm -f "$TMP"
echo "Backup uploaded: s3://${S3_BUCKET}/backups/db-${STAMP}.sql.gz"
