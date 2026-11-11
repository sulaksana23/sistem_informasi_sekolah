#!/bin/bash
# Helper CLI for the Laravel docker base. Run from the project root.
set -e

cd "$(dirname "$0")"

# Deliberately NOT sourcing .env into this shell: `docker compose` already
# reads .env on its own for build-arg/environment interpolation, and this
# file's UID=/GID= keys (kept consistent with Laravel's docker convention)
# would collide with bash's own readonly $UID, breaking `source` entirely.
env_var() {
  [ -f .env ] || return 0
  grep "^$1=" .env | tail -n1 | cut -d= -f2-
}
COMPOSE_PROFILES="$(env_var COMPOSE_PROFILES)"

if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "Error: neither 'docker compose' nor 'docker-compose' found." >&2
  exit 1
fi

usage() {
  cat <<EOF
Usage: ./docker.sh <command> [args]

  up               Build (if needed) and start containers in background
  down             Stop and remove containers
  restart          Restart containers
  build            Rebuild images
  logs [service]   Tail logs (all services, or one)
  shell            Open a bash shell in the app container
  artisan <args>   Run php artisan <args> inside the app container
  composer <args>  Run composer <args> inside the app container
  npm <args>       Run npm <args> inside the node container
  fresh            composer install + migrate:fresh --seed + npm install
  permissions      Fix storage/bootstrap cache permissions inside the app container
EOF
}

require_env() {
  if [ -z "${COMPOSE_PROFILES:-}" ]; then
    echo "Warning: COMPOSE_PROFILES is empty in .env — only 'app' and 'nginx' will start." >&2
  fi
}

check_secrets() {
  # docker-compose.yml falls back to DB_PASSWORD:-secret /
  # REDIS_PASSWORD:-secretpassword when those vars are unset, so the compose
  # file still parses fine for projects that don't use mariadb/postgres/redis
  # at all. But those fallbacks are well-known placeholder values — never
  # safe to actually run a container with. new-project.sh always writes a
  # real (generated-if-empty) password for any profile it enables, so this
  # should never trigger in the normal flow; it's a safety net for a
  # hand-edited .env, a botched merge into an existing project's .env, or a
  # profile turned on after the fact without re-running new-project.sh.
  local problems=""
  if echo "${COMPOSE_PROFILES:-}" | grep -qwE 'mariadb|postgres'; then
    local db_pw
    db_pw="$(env_var DB_PASSWORD)"
    if [ -z "$db_pw" ] || [ "$db_pw" = "secret" ]; then
      problems="${problems}  - DB_PASSWORD kosong atau masih default (\"secret\") di .env, padahal profile mariadb/postgres aktif.\n"
    fi
  fi
  if echo "${COMPOSE_PROFILES:-}" | grep -qw redis; then
    local redis_pw
    redis_pw="$(env_var REDIS_PASSWORD)"
    if [ -z "$redis_pw" ] || [ "$redis_pw" = "secretpassword" ]; then
      problems="${problems}  - REDIS_PASSWORD kosong atau masih default (\"secretpassword\") di .env, padahal profile redis aktif.\n"
    fi
  fi
  if [ -n "$problems" ]; then
    echo "Error: kredensial berikut belum diisi dengan benar di .env:" >&2
    printf "%b" "$problems" >&2
    echo "Isi manual di .env dengan password sungguhan, atau jalankan ulang scripts/new-project.sh supaya password random ter-generate otomatis." >&2
    exit 1
  fi
}

cmd="${1:-}"
shift || true

case "$cmd" in
  up)
    require_env
    check_secrets
    $DC up -d --build
    ;;
  down)
    $DC down
    ;;
  restart)
    check_secrets
    $DC restart
    ;;
  build)
    $DC build "$@"
    ;;
  logs)
    $DC logs -f "$@"
    ;;
  shell)
    $DC exec app bash
    ;;
  artisan)
    $DC exec app php artisan "$@"
    ;;
  composer)
    $DC exec app composer "$@"
    ;;
  npm)
    $DC exec node npm "$@"
    ;;
  fresh)
    $DC exec app composer install --optimize-autoloader
    $DC exec app php artisan migrate:fresh --seed --no-interaction
    if echo "${COMPOSE_PROFILES:-}" | grep -q node; then
      $DC exec node npm install
    fi
    ;;
  permissions)
    $DC exec app bash -c "chmod -R ug+rwX storage bootstrap/cache"
    ;;
  ""|help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    usage
    exit 1
    ;;
esac
