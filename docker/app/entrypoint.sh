#!/bin/bash
set -e

echo "Installing Composer dependencies..."
composer install --optimize-autoloader

echo "Assign artisan permission..."
chmod +x artisan

echo "Create directory for supervisor logs..."
mkdir -p /var/www/storage/logs/supervisor/stdout
mkdir -p /var/www/storage/logs/supervisor/stderr

# Auto-migrate so the app is usable right after `docker.sh up` without an
# extra manual `docker.sh artisan migrate` step (common first-run failure:
# SESSION_DRIVER=database but the sessions table doesn't exist yet). Skipped
# in production on purpose — auto-applying pending migrations on every
# container restart is fine for local/dev/test but too risky to run
# unattended against a real database (same policy as the scheduler, which
# only runs when APP_ENV=production — see docker-compose.yml).
#
# Retries a few times even though docker-compose.yml's `depends_on` now
# gates this container on mariadb/postgres reporting `healthy` first (see
# their healthcheck: blocks) — that's the first line of defense, this loop
# is the second. On first boot, both official images restart internally
# once right after bootstrapping MYSQL_DATABASE/POSTGRES_DB, and the
# healthcheck can briefly report healthy just before that restart — so
# "healthy" doesn't 100% guarantee "ready for this exact connection" yet.
if [ "${APP_ENV:-local}" != "production" ]; then
  echo "Running database migrations (APP_ENV=${APP_ENV:-local})..."
  MIGRATE_OK="false"
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if php artisan migrate --force; then
      MIGRATE_OK="true"
      break
    fi
    echo "  Migrate belum berhasil (percobaan $i/10) — database mungkin belum siap, coba lagi 2 detik lagi..."
    sleep 2
  done
  [ "$MIGRATE_OK" = "false" ] && echo "Warning: migrate gagal setelah 10x percobaan — jalankan manual: ./docker.sh artisan migrate"
else
  echo "APP_ENV=production — migrate TIDAK dijalankan otomatis, jalankan manual/lewat pipeline deploy."
fi

# The Dockerfile already switches to $USR before this entrypoint runs, so
# supervisord and everything it spawns (php-fpm, horizon, scheduler) run as
# that non-root user — no privilege drop needed here.
echo "Starting Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
