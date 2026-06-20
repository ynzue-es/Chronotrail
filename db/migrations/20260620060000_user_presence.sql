-- migrate:up
-- Lightweight "online now" presence: the app heartbeats the current user's
-- row; admins read it (via service_role, which bypasses RLS) to list users
-- active in the last couple of minutes. No realtime service required.
create table if not exists user_presence (
    user_id uuid primary key references auth.users(id) on delete cascade,
    last_seen timestamptz not null default now(),
    path text
);

create index if not exists user_presence_last_seen_idx on user_presence (last_seen desc);

alter table user_presence enable row level security;

-- A user may read and upsert only their own presence row.
drop policy if exists "own presence select" on user_presence;
create policy "own presence select" on user_presence
    for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "own presence insert" on user_presence;
create policy "own presence insert" on user_presence
    for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "own presence update" on user_presence;
create policy "own presence update" on user_presence
    for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- migrate:down
drop table if exists user_presence;
