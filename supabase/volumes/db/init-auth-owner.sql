-- The supabase/postgres image pre-creates the `auth` schema and the
-- auth.uid()/role()/email() helper functions owned by supabase_admin.
-- GoTrue connects as supabase_auth_admin and runs `create or replace function`
-- on those during its own migrations, which fails with "must be owner".
-- Hand ownership to supabase_auth_admin so GoTrue migrations succeed on a
-- fresh database init.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    EXECUTE 'ALTER SCHEMA auth OWNER TO supabase_auth_admin';
  END IF;
END $$;

ALTER FUNCTION auth.uid()   OWNER TO supabase_auth_admin;
ALTER FUNCTION auth.role()  OWNER TO supabase_auth_admin;
ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;
