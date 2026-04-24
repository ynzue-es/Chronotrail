# Supabase Self-Hosted Template

Template prêt-à-l'emploi pour lancer un Supabase self-hosted.

## Installation rapide

```bash
# 1. Clone ce template
git clone <this-repo> mon-projet
cd mon-projet

# 2. Copie le .env et génère tes secrets
cp .env.example .env
sh ./utils/generate-keys.sh
sh ./utils/add-new-auth-keys.sh

# 3. Génère les autres secrets manuellement
# POSTGRES_PASSWORD, DASHBOARD_PASSWORD, SECRET_KEY_BASE, VAULT_ENC_KEY, 
# PG_META_CRYPTO_KEY, LOGFLARE_*, S3_PROTOCOL_*
# (voir les openssl rand dans la doc)

# 4. Lance
docker compose up -d
```

## Accès

- Studio : http://localhost:8000 (login défini dans .env)
- API : http://localhost:8000
- Postgres : localhost:5432

## Reset complet

```bash
docker compose down -v
rm -rf volumes/db/data volumes/storage volumes/pooler
docker compose up -d
```
