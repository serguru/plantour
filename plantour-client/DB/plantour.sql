drop schema if exists plantour cascade;

create schema plantour;

set search_path to plantour, public;

-- create table currencies (
--     id bigint primary key,
--     name varchar(50) not null unique,
--     character text,
--     notes text
-- );

-- insert into currencies (id, name, character) values
-- (1,'USD','$'),
-- (2,'CAD','$'),
-- (3,'EUR','€'),
-- (4,'GBP','£'),
-- (5,'JPY','¥'),
-- (6,'CNY','¥');  

-- create table unit_categories (
--     id bigint primary key,
--     name varchar(50) not null unique,
--     notes text
-- );

-- insert into unit_categories (id, name) values
-- (1, 'weight'),
-- (2, 'volume'),
-- (3, 'length');

-- -- Units of measurement table
-- create table units (
--     id bigint primary key,
--     unit_category_id bigint not null references unit_categories(id),
--     name varchar(50) not null unique,
--     abbreviation varchar(10) not null unique
-- );


-- -- Insert common units
-- insert into units (id, unit_category_id, name, abbreviation) values
-- (1, 1, 'Kilogram', 'kg'),
-- (2, 1, 'Gram', 'g'),
-- (3, 1, 'Pound', 'lb'),
-- (4, 1, 'Ounce', 'oz'),
-- (5, 2, 'Liter', 'L'),
-- (6, 2, 'Milliliter', 'ml'),
-- (7, 3, 'Meter', 'm'),
-- (8, 3, 'Centimeter', 'cm'),
-- (9, 3, 'Inch', 'in');


-- create schema pack;

-- -- Set search path to the pack schema
-- set search_path to pack, public;

-- create table trip_status (
--     id bigint primary key,
--     name varchar(100) not null unique,
--     notes text
-- );

-- insert into trip_status (id, name) values
-- (1, 'Planning'),
-- (2, 'Active'),
-- (3, 'Completed'),
-- (4, 'Archived');

-- create table packing_status (
--     id bigint primary key,
--     name varchar(100) not null unique,
--     notes text
-- );

-- insert into packing_status (id, name) values
-- (1, 'Planning'),
-- (2, 'Active'),
-- (3, 'Completed'),
-- (4, 'Verified');

-- Pack users table
-- create table pack_users (
--     id bigserial primary key,
--     plantour_user_id uuid not null unique references auth.users(id) on delete cascade
-- );

-- Travelers table
-- Contains admins and participants
-- A row in this table appears when:
-- - a new admin registered as supabase auth user
-- - the admin sent invitation to a future participant
create table travelers (
    id uuid not null primary key default gen_random_uuid(),
    -- not null for admins, null or filled for participants
    user_id uuid null unique references auth.users(id) on delete set null,
    -- null for admins, not null for participants
    admin_id uuid null references travelers(id) on delete cascade,
    first_name varchar(100) null,
    last_name varchar(100) null,
    email varchar(255) null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone varchar(50),
    notes text,
    -- null for admins, not null for participants
    participant_code varchar(10) null,
    
    constraint ch_travelers_participant check (
        admin_id is not null and participant_code is not null and user_id is null
        or
        admin_id is null and participant_code is null and user_id is not null
    )    
);
create index idx_travelers_admin_id on travelers(admin_id);

-- Categories for traveler's things
create table thing_categories_j (
    id uuid not null primary key default  gen_random_uuid(),
    traveler_id uuid not null references travelers(id) on delete cascade,
    version integer not null default 1 check (version > 0),
    json_object jsonb not null
);
create index thing_categories_j_traveler_id on thing_categories_j(traveler_id);

-- Traveler's things
create table things_j (
    id uuid not null primary key default  gen_random_uuid(),
    category_id uuid not null references thing_categories_j(id) on delete cascade,
    version integer not null default 1 check (version > 0),
    json_object jsonb not null

    -- short_description varchar(200) not null,
    -- description text,
    -- brand varchar(100),
    -- model varchar(100),
    -- color varchar(50),
    
    -- -- Weight and dimensions
    -- weight_value decimal(10,3),
    -- weight_unit_id bigint references shared.units(id),
    -- length_value decimal(10,2),
    -- width_value decimal(10,2),
    -- height_value decimal(10,2),
    -- dimension_unit_id bigint references shared.units(id),
    
    -- -- Purchase info
    -- purchase_date date,
    -- purchase_price decimal(10,2),
    -- purchase_currency_id bigint null references shared.currencies(id)
);
create index idx_things_j_category_id on things_j(category_id);

-- Categories for traveler's packages
create table package_categories_j (
    id uuid not null primary key default  gen_random_uuid(),
    traveler_id uuid not null references travelers(id) on delete cascade,
    version integer not null default 1 check (version > 0),
    json_object jsonb not null
);
create index idx_package_categories_j_traveler_id on thing_categories_j(traveler_id);

-- Traveler's packaging
create table packages_j (
    id uuid not null primary key default  gen_random_uuid(),
    category_id uuid not null references package_categories_j(id) on delete cascade,

    -- Nested package support
    parent_package_id uuid null references packages_j(id) on delete set null,

    version integer not null default 1 check (version > 0),
    json_object jsonb not null

    -- short_description varchar(200) not null,
    -- description text,
    -- brand varchar(100),
    -- model varchar(100),
    -- color varchar(50),
    
    -- empty_weight_value decimal(10,3),
    -- weight_unit_id bigint references shared.units(id),
    -- capacity_value decimal(10,2),
    -- capacity_unit_id bigint references shared.units(id),
    -- length_value decimal(10,2),
    -- width_value decimal(10,2),
    -- height_value decimal(10,2),
    -- dimension_unit_id bigint references shared.units(id),
    
);
create index idx_packages_j_category_id on packages_j(category_id);
create index idx_packages_j_parent_package_id on packages_j(parent_package_id);


-- Trips table
create table trips_j (

    id uuid not null primary key default  gen_random_uuid(),
    user_id uuid not null references travelers(user_id) on delete cascade,
    version integer not null default 1 check (version > 0),
    json_object jsonb not null


    -- id bigserial primary key,
    -- pack_user_id bigint not null references pack_users(id) on delete cascade,
    -- trip_status_id bigint not null references trip_status(id) on delete cascade,
    -- short_description varchar(200) not null,  
    -- description text,
    -- start_date date,
    -- end_date date,
    -- require_weight boolean default false,
    -- constraint ch_trips_start_before_end check (
    --     start_date is null 
    --     or end_date is null 
    --     or start_date <= end_date
    -- )
);
create index idx_trips_j_user_id on trips_j(user_id);

create table trip_travelers_j (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips_j(id) on delete cascade,
    traveler_id uuid not null references travelers(id) on delete cascade,
    version integer not null default 1 check (version > 0),
    json_object jsonb not null


    -- id bigserial primary key,
    -- trip_id bigint not null references trips(id) on delete cascade,
    -- traveler_id bigint not null references travelers(id) on delete cascade,
    -- responsible_traveler_id bigint references travelers(id), -- who is responsible for this packing
    -- packing_status_id bigint not null references packing_status(id) on delete cascade,
    -- start_date date,
    -- end_date date,
    -- packing_data jsonb not null default '{}',
    -- unique(trip_id, traveler_id),
    -- constraint ch_traveler_trip_things_start_before_end check (
    --     start_date is null 
    --     or end_date is null 
    --     or start_date <= end_date
    -- )
);
create index idx_trip_travelers_j_trip_id on trip_travelers_j(trip_id);
create index idx_trip_travelers_j_traveler_id on trip_travelers_j(traveler_id);
create unique index idx_trip_travelers_j_traveler_id_trip_id on trip_travelers_j(trip_id,traveler_id);

create table trip_things_j (
    id uuid not null primary key default gen_random_uuid(),
    trip_traveler_id uuid not null references trip_travelers_j(id) on delete cascade,
    thing_id uuid not null references things_j(id) on delete cascade,
    package_id uuid null references packages_j(id) on delete set null,
    version integer not null default 1 check (version > 0),
    json_object jsonb not null
);
create index idx_trip_things_j_trip_traveler_id on trip_things_j(trip_traveler_id);
create index idx_trip_things_j_trip_thing_id on trip_things_j(thing_id);
create index idx_trip_things_j_package_id on trip_things_j(package_id);
create unique index idx_trip_things_j_trip_traveler_id_thing_id on trip_things_j(trip_traveler_id,thing_id);

-- packages_j → package_categories_j → travelers
create or replace function raise_integrity_error(msg text)
returns void as $$
begin
    raise exception using message = msg;
end;
$$ language plpgsql;

create or replace function trg_packages_same_traveler()
returns trigger as $$
declare
    cat_trav uuid;
    parent_cat_trav uuid;
begin
    -- Категория пакета
    select traveler_id into cat_trav
    from package_categories_j
    where id = new.category_id;

    if cat_trav is null then
        perform raise_integrity_error('Package refers to non-existing category');
    end if;

    -- Проверка nested-package (parent_package_id)
    if new.parent_package_id is not null then
        select pc.traveler_id into parent_cat_trav
        from packages_j p
        join package_categories_j pc on pc.id = p.category_id
        where p.id = new.parent_package_id;

        if parent_cat_trav is distinct from cat_trav then
            perform raise_integrity_error('Package parent belongs to different traveler');
        end if;
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trg_packages_same_traveler
before insert or update on packages_j
for each row execute function trg_packages_same_traveler();


-- things_j → thing_categories_j → travelers
create or replace function trg_things_same_traveler()
returns trigger as $$
declare
    cat_trav uuid;
begin
    select traveler_id into cat_trav
    from thing_categories_j
    where id = new.category_id;

    if cat_trav is null then
        perform raise_integrity_error('Thing refers to non-existing category');
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trg_things_same_traveler
before insert or update on things_j
for each row execute function trg_things_same_traveler();

-- trip_travelers_j → travelers, trips_j
create or replace function trg_trip_travelers_valid()
returns trigger as $$
declare
    t_exists boolean;
begin
    select true into t_exists
    from travelers
    where id = new.traveler_id;

    if not t_exists then
        perform raise_integrity_error('trip_traveler refers to nonexistent traveler');
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trg_trip_travelers_valid
before insert or update on trip_travelers_j
for each row execute function trg_trip_travelers_valid();

-- trip_things_j → thing, package, trip_traveler → один traveler
create or replace function trg_trip_things_same_traveler()
returns trigger as $$
declare
    tt_trav uuid;
    thing_trav uuid;
    pkg_trav uuid;
begin
    -- Traveler of trip_traveler
    select traveler_id into tt_trav
    from trip_travelers_j
    where id = new.trip_traveler_id;

    if tt_trav is null then
        perform raise_integrity_error('trip_things refers to nonexistent trip_traveler');
    end if;

    -- Traveler of thing
    select tc.traveler_id into thing_trav
    from things_j t
    join thing_categories_j tc on tc.id = t.category_id
    where t.id = new.thing_id;

    if thing_trav is null then
        perform raise_integrity_error('trip_things refers to nonexistent thing');
    end if;

    if tt_trav is distinct from thing_trav then
        perform raise_integrity_error('trip_things thing belongs to another traveler');
    end if;

    -- Traveler of package (nullable)
    if new.package_id is not null then
        select pc.traveler_id into pkg_trav
        from packages_j p
        join package_categories_j pc on pc.id = p.category_id
        where p.id = new.package_id;

        if pkg_trav is null then
            perform raise_integrity_error('trip_things refers to nonexistent package');
        end if;

        if tt_trav is distinct from pkg_trav then
            perform raise_integrity_error('trip_things package belongs to another traveler');
        end if;
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trg_trip_things_same_traveler
before insert or update on trip_things_j
for each row execute function trg_trip_things_same_traveler();
