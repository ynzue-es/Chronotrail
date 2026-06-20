-- Set passwords for the Supabase service roles to POSTGRES_PASSWORD.
-- This minimal stack omits the functions and pooler services, so some roles
-- the stock script expects (supabase_functions_admin, pgbouncer) may not exist.
-- Guard each ALTER so a missing role doesn't abort the whole init script.
--
-- psql ':var' interpolation does NOT happen inside dollar-quoted ($$) bodies,
-- so stash the password into a session GUC at top level, then read it back
-- with current_setting() inside the DO block.
\set pgpass `echo "$POSTGRES_PASSWORD"`
SELECT set_config('chronotrail.pgpass', :'pgpass', false);

DO $$
DECLARE
  r text;
  pw text := current_setting('chronotrail.pgpass');
BEGIN
  FOREACH r IN ARRAY ARRAY[
    'authenticator',
    'pgbouncer',
    'supabase_auth_admin',
    'supabase_functions_admin',
    'supabase_storage_admin'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('ALTER USER %I WITH PASSWORD %L', r, pw);
    END IF;
  END LOOP;
END $$;
