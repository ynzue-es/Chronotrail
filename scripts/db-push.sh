#!/bin/bash
set -e

POSTGRES_PASSWORD=$(grep -E '^POSTGRES_PASSWORD=' supabase/.env | cut -d '=' -f2-)

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "❌ POSTGRES_PASSWORD introuvable dans supabase/.env"
  exit 1
fi

DB_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:54322/postgres?sslmode=disable"

supabase db push --db-url "$DB_URL" --debug "$@" 2>&1 | grep -v "^2026/" | grep -v "^PG "