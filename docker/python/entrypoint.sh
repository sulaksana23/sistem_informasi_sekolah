#!/bin/bash
set -e

echo "Python entrypoint starting..."
cd /var/www/python

if [ -f "requirements.txt" ]; then
  echo "Installing pip dependencies..."
  pip install --user -r requirements.txt
else
  echo "No requirements.txt found in ./python — skipping pip install."
fi

export PATH="$HOME/.local/bin:$PATH"

# PYTHON_START_CMD is intentionally free-form so any framework (Flask,
# FastAPI/uvicorn, a plain worker script, ...) can be used — set it in .env.
START_CMD=${PYTHON_START_CMD:-"python app.py"}

echo "Starting: $START_CMD"
exec $START_CMD
