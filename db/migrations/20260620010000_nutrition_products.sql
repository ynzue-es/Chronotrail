-- migrate:up
-- Catalogue de produits nutrition (gels, barres, boissons). created_by NULL =
-- catalogue global lisible par tous ; sinon produit perso de l'utilisateur.
create table nutrition_products (
    id uuid primary key default gen_random_uuid(),
    created_by uuid references auth.users(id) on delete cascade,
    name text not null,
    brand text,
    kind text not null default 'gel', -- gel | bar | drink | chew
    carbs_g numeric not null,
    sodium_mg numeric,
    shop_url text,
    created_at timestamptz not null default now()
);

alter table nutrition_products enable row level security;

drop policy if exists "read products" on nutrition_products;
create policy "read products" on nutrition_products for select to authenticated
    using (created_by is null or created_by = auth.uid());

drop policy if exists "insert own products" on nutrition_products;
create policy "insert own products" on nutrition_products for insert to authenticated
    with check (created_by = auth.uid());

drop policy if exists "update own products" on nutrition_products;
create policy "update own products" on nutrition_products for update to authenticated
    using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists "delete own products" on nutrition_products;
create policy "delete own products" on nutrition_products for delete to authenticated
    using (created_by = auth.uid());

-- Produits favoris de l'utilisateur.
create table favorite_products (
    user_id uuid not null references auth.users(id) on delete cascade,
    product_id uuid not null references nutrition_products(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, product_id)
);

alter table favorite_products enable row level security;

drop policy if exists "own favorites" on favorite_products;
create policy "own favorites" on favorite_products for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Course mise en favori.
alter table courses add column if not exists is_favorite boolean not null default false;

-- Catalogue global de départ (valeurs glucides approximatives par portion).
insert into nutrition_products (created_by, name, brand, kind, carbs_g, sodium_mg, shop_url) values
    (null, 'GO Isotonic Energy Gel', 'SiS', 'gel', 22, 0, null),
    (null, 'Gel 100', 'Maurten', 'gel', 25, 0, null),
    (null, 'Gel énergétique', 'Aptonia (Decathlon)', 'gel', 25, 50, null),
    (null, 'Gel énergétique', 'TORQ', 'gel', 30, 0, null),
    (null, 'Clif Bar', 'Clif', 'bar', 44, 150, null),
    (null, 'Barre de céréales sport', 'Aptonia (Decathlon)', 'bar', 25, 80, null),
    (null, 'Boisson énergétique (500 ml)', 'High5', 'drink', 47, 250, null);

-- migrate:down
alter table courses drop column if exists is_favorite;
drop table if exists favorite_products;
drop table if exists nutrition_products;
