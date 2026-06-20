-- migrate:up
-- Ravitos d'une course : [{ "km": number, "name": string }], édités par l'utilisateur.
alter table courses
    add column if not exists aid_stations jsonb not null default '[]'::jsonb;

-- migrate:down
alter table courses drop column if exists aid_stations;
