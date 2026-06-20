-- migrate:up
-- Courses réelles importées servant à caler le profil de forme de l'utilisateur.
-- On ne stocke que le résumé calibré (pas la trace complète).
create table fitness_activities (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    activity_date date,
    distance_m numeric not null,
    elevation_gain_m numeric,
    moving_time_s numeric not null,
    reference_pace_s_per_km numeric not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_fitness_user on fitness_activities (user_id, created_at desc);

alter table fitness_activities enable row level security;

drop policy if exists "own fitness" on fitness_activities;
create policy "own fitness" on fitness_activities for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

-- migrate:down
drop table if exists fitness_activities;
