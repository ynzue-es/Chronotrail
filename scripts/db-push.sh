#!/bin/bash
set -e

# Applique les migrations dbmate (db/migrations) sur la DB locale.
# Usage: ./scripts/db-push.sh [up|status|rollback|new <name> ...]

POSTGRES_PASSWORD=$(grep -E '^POSTGRES_PASSWORD=' supabase/.env | cut -d '=' -f2-)

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "❌ POSTGRES_PASSWORD introuvable dans supabase/.env"
  exit 1
fi

export DATABASE_URL="postgres://postgres:${POSTGRES_PASSWORD}@localhost:54322/postgres?sslmode=disable"

# Sous-commande par défaut : up
CMD="${1:-up}"
shift || true

dbmate --no-dump-schema "$CMD" "$@"
