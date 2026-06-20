-- migrate:up
alter table races add column if not exists image_url text;
alter table nutrition_products add column if not exists image_url text;

-- migrate:down
alter table races drop column if exists image_url;
alter table nutrition_products drop column if exists image_url;
