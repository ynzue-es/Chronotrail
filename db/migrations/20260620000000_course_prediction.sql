-- migrate:up
-- Champs de prédiction stockés au résumé (la liste les affiche sans recalcul).
-- Les splits / segments / cues restent calculés à la volée depuis track_points.
alter table courses
    add column if not exists reference_pace_s_per_km numeric,
    add column if not exists predicted_time_s numeric;

-- migrate:down
alter table courses
    drop column if exists reference_pace_s_per_km,
    drop column if exists predicted_time_s;
