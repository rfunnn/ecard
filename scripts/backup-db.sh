#!/usr/bin/env bash
# Database backup script — run via cron on the VPS.
#
# Cron setup (daily at 2am, keep 30 days):
#   0 2 * * * /opt/ecard/ecard/scripts/backup-db.sh >> /var/log/ekadku-backup.log 2>&1
#
# Required env vars (add to /etc/environment or source a .env):
#   DB_USER, DB_PASSWORD, DB_NAME
#   BACKUP_DIR  (default: /opt/ecard/backups)
#   KEEP_DAYS   (default: 30)

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/ecard/backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/ekadku_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date -Iseconds)] Starting backup → $FILENAME"

docker exec ekadku-db-1 \
  mysqldump \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    "$DB_NAME" \
  | gzip > "$FILENAME"

echo "[$(date -Iseconds)] Backup complete ($(du -sh "$FILENAME" | cut -f1))"

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "ekadku_*.sql.gz" -mtime +"$KEEP_DAYS" -delete
echo "[$(date -Iseconds)] Pruned backups older than ${KEEP_DAYS} days"
