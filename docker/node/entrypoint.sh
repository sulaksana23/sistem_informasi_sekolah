#!/bin/sh
set -e

echo "Node entrypoint starting..."
echo "APP_ENV=${APP_ENV:-local}"

APP_ENV=${APP_ENV:-local}
NODE_PORT=${NODE_PORT:-5173}

cd /var/www

echo "Running npm install..."
npm install

# Works the same for Blade (Vite compiling CSS/JS assets loaded via @vite())
# and Inertia (Vite serving the SPA bundle) — whether this service is used
# at all is controlled by the `node` compose profile, not by stack type.
if [ "$APP_ENV" = "production" ]; then
  echo "Running production build..."
  npm run build
  rm -f public/hot
else
  echo "Running dev server..."
  npm run dev -- --host --port "$NODE_PORT" --strictPort
fi

tail -f /dev/null
