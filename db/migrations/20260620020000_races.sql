-- migrate:up
-- Calendrier curé de courses (données de référence, lecture publique).
-- Dates/coords indicatives : chaque course pointe vers son site officiel.
create table races (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    location_name text not null,
    region text,
    lat numeric not null,
    lng numeric not null,
    race_date date not null,
    distance_km numeric,
    elevation_gain_m numeric,
    url text,
    created_at timestamptz not null default now()
);

create index if not exists idx_races_date on races (race_date);

alter table races enable row level security;

drop policy if exists "read races" on races;
create policy "read races" on races for select to anon, authenticated using (true);

insert into races (name, location_name, region, lat, lng, race_date, distance_km, elevation_gain_m, url) values
 ('Marathon du Mont-Blanc', 'Chamonix', 'Haute-Savoie', 45.9237, 6.8694, '2026-06-26', 42, 2500, 'https://www.montblancmarathon.net'),
 ('Trail des Passerelles du Monteynard', 'Treffort', 'Isère', 44.9200, 5.6200, '2026-06-27', 65, 3500, 'https://www.tpm38.fr'),
 ('High Trail Vanoise', 'Val d''Isère', 'Savoie', 45.4485, 6.9799, '2026-07-12', 70, 5000, 'https://www.hightrailvanoise.com'),
 ('6000D', 'La Plagne', 'Savoie', 45.5070, 6.6770, '2026-07-25', 65, 3600, 'https://www.6000d.com'),
 ('Échappée Belle', 'Vizille', 'Isère', 45.0786, 5.7720, '2026-08-21', 144, 11000, 'https://www.echappeebelletrail.com'),
 ('Grand Raid des Pyrénées', 'Vielle-Aure', 'Hautes-Pyrénées', 42.7920, 0.1460, '2026-08-21', 120, 7500, 'https://www.grandraidpyrenees.com'),
 ('UTMB', 'Chamonix', 'Haute-Savoie', 45.9237, 6.8694, '2026-08-28', 171, 10000, 'https://utmbmontblanc.com'),
 ('Le Grand Trail de Serre-Ponçon', 'Savines-le-Lac', 'Hautes-Alpes', 44.5100, 6.4000, '2026-09-12', 70, 4200, 'https://www.trailserreponcon.com'),
 ('Trail de Guerlédan', 'Mûr-de-Bretagne', 'Côtes-d''Armor', 48.2100, -3.0000, '2026-09-19', 45, 1500, 'https://www.trailguerledan.fr'),
 ('Le Grand Raid (Diagonale des Fous)', 'Saint-Pierre', 'La Réunion', -21.3393, 55.4781, '2026-10-15', 165, 10000, 'https://www.grandraid-reunion.com'),
 ('Festival des Templiers', 'Millau', 'Aveyron', 44.0990, 3.0780, '2026-10-23', 75, 3600, 'https://www.festivaldestempliers.com'),
 ('Trail des Forts', 'Besançon', 'Doubs', 47.2380, 6.0240, '2026-10-04', 28, 1300, 'https://www.trail-des-forts.fr'),
 ('SaintéLyon', 'Saint-Étienne', 'Loire', 45.4397, 4.3872, '2026-11-28', 78, 2000, 'https://www.saintelyon.com'),
 ('Saintexpress (SaintéLyon)', 'Sainte-Catherine', 'Rhône', 45.6300, 4.5200, '2026-11-29', 44, 1100, 'https://www.saintelyon.com');

-- migrate:down
drop table if exists races;
