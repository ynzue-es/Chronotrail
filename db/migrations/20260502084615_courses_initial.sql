-- migrate:up
create table if not exists courses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    gpx_path text not null,
    distance_m numeric,
    elevation_gain_m numeric,
    elevation_loss_m numeric,
    bounds jsonb,
    track_points jsonb,
    nutrition_settings jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_courses_user_id on courses (user_id);
create index if not exists idx_courses_created_at on courses (created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_courses_updated_at on courses;
create trigger trg_courses_updated_at
before update on courses
for each row
execute function set_updated_at();

alter table courses enable row level security;

drop policy if exists "Users can view their own courses" on courses;
create policy "Users can view their own courses"
on courses for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create their own courses" on courses;
create policy "Users can create their own courses"
on courses for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own courses" on courses;
create policy "Users can update their own courses"
on courses for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own courses" on courses;
create policy "Users can delete their own courses"
on courses for delete to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'gpx-files',
    'gpx-files',
    false,
    10485760,
    array['application/gpx+xml', 'application/xml', 'text/xml']
)
on conflict (id) do nothing;

drop policy if exists "Users can read their own GPX files" on storage.objects;
create policy "Users can read their own GPX files"
on storage.objects for select to authenticated
using (bucket_id = 'gpx-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can upload GPX files in their own folder" on storage.objects;
create policy "Users can upload GPX files in their own folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'gpx-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own GPX files" on storage.objects;
create policy "Users can update their own GPX files"
on storage.objects for update to authenticated
using (bucket_id = 'gpx-files' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'gpx-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own GPX files" on storage.objects;
create policy "Users can delete their own GPX files"
on storage.objects for delete to authenticated
using (bucket_id = 'gpx-files' and (storage.foldername(name))[1] = auth.uid()::text);

-- migrate:down
drop policy if exists "Users can delete their own GPX files" on storage.objects;
drop policy if exists "Users can update their own GPX files" on storage.objects;
drop policy if exists "Users can upload GPX files in their own folder" on storage.objects;
drop policy if exists "Users can read their own GPX files" on storage.objects;
delete from storage.buckets where id = 'gpx-files';
drop table if exists courses;
drop function if exists set_updated_at();
