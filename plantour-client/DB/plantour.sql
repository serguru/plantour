drop schema if exists plantour cascade;

create schema plantour;

set search_path to plantour, public;

create table currencies (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    character text,
    notes text
);

insert into currencies (name, character) values
('USD','$'),
('CAD','$'),
('EUR','€'),
('GBP','£'),
('JPY','¥'),
('CNY','¥');  

create table unit_categories (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    notes text
);

-- Units of measurement table
create table units (
    id uuid not null primary key default gen_random_uuid(),
    unit_category_id uuid not null references unit_categories(id),
    name varchar(50) not null unique,
    abbreviation varchar(10) not null unique
);

DO $$
DECLARE
    data jsonb := '[
        {"weight": ["kg", "g", "lb", "oz"]},
        {"volume": ["L", "ml"]},
        {"length": ["m", "cm", "in"]}
    ]';

    category jsonb;
    category_name text;
    units jsonb;
    unit text;

    category_id uuid;
    unit_id uuid;

BEGIN
    -- цикл по внешнему массиву
    FOR category IN SELECT * FROM jsonb_array_elements(data)
    LOOP
        -- key = имя категории, value = массив единиц
        category_name := (SELECT key FROM jsonb_object_keys(category) AS key LIMIT 1);
        units := category -> category_name;

        -- генерируем uuid категории
        category_id := gen_random_uuid();

        -- вставляем категорию
        INSERT INTO unit_categories (id, name)
        VALUES (category_id, category_name);

        -- цикл по внутреннему массиву единиц
        FOR unit IN SELECT jsonb_array_elements_text(units)
        LOOP
            unit_id := gen_random_uuid();

            INSERT INTO units (id, unit_category_id, name, abbreviation)
            VALUES (unit_id, category_id, unit, unit);
        END LOOP;
    END LOOP;

END $$;

create table trip_status (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    notes text
);

insert into trip_status (name) values
('Planning'),
('Active'),
('Completed'),
('Archived');

create table packing_status (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    notes text
);

insert into packing_status (name) values
('Planning'),
('Active'),
('Completed'),
('Verified');

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
    
    constraint ch_travelers_admin_user check (
        admin_id is not null and user_id is null
        or
        admin_id is null and user_id is not null
    )    
);
create index idx_travelers_admin_id on travelers(admin_id);
create index idx_travelers_user_id on travelers(user_id);

-------------------------------------------
-- Categories for traveler's things
-- dictionary
create table thing_categories (
    id uuid not null primary key default  gen_random_uuid(),
    traveler_id uuid not null references travelers(id) on delete cascade,
    name varchar(100) not null
);
create unique index thing_categories_traveler_id_name on thing_categories(traveler_id, name);

-- Traveler's things
-- dictionary
create table things (
    id uuid not null primary key default  gen_random_uuid(),
    category_id uuid not null references thing_categories(id) on delete cascade,

    short_description varchar(200) not null,
    description text,
    brand varchar(100),
    model varchar(100),
    color varchar(50),
    
    -- Weight and dimensions
    weight_value decimal(10,3),
    weight_unit_id uuid references units(id),
    length_value decimal(10,2),
    width_value decimal(10,2),
    height_value decimal(10,2),
    dimension_unit_id uuid references units(id),
    
    -- Purchase info
    purchase_date date,
    purchase_price decimal(10,2),
    purchase_currency_id uuid null references currencies(id)
);
create index idx_things_category_id on things(category_id);

-- Categories for traveler's packages
-- dictionary
create table package_categories (
    id uuid not null primary key default  gen_random_uuid(),
    traveler_id uuid not null references travelers(id) on delete cascade,
    name varchar(50) not null unique,
    notes text
);
create index idx_package_categories_traveler_id on thing_categories(traveler_id);

-- Traveler's packaging
-- dictionary
create table packages (
    id uuid not null primary key default  gen_random_uuid(),
    category_id uuid not null references package_categories(id) on delete cascade,

    -- Nested package support
    parent_package_id uuid null references packages(id) on delete set null,

    short_description varchar(200) not null,
    description text,
    brand varchar(100),
    model varchar(100),
    color varchar(50),
    
    empty_weight_value decimal(10,3),
    weight_unit_id uuid references units(id),
    capacity_value decimal(10,2),
    capacity_unit_id uuid references units(id),
    length_value decimal(10,2),
    width_value decimal(10,2),
    height_value decimal(10,2),
    dimension_unit_id uuid references units(id),
);
create index idx_packages_category_id on packages(category_id);
create index idx_packages_parent_package_id on packages(parent_package_id);

-- Trips table
create table trips (

    id uuid not null primary key default  gen_random_uuid(),
    user_id uuid not null references travelers(user_id) on delete cascade,

    --trip_status_id uuid null references trip_status(id) on delete set null,
    trip_status varchar(100) null,
    
    short_description varchar(200) not null,  
    description text,
    start_date date,
    end_date date,
    require_weight boolean default false,
    constraint ch_trips_start_before_end check (
        start_date is null 
        or end_date is null 
        or start_date <= end_date
    )
);
create index idx_trips_user_id on trips(user_id);

create table communication_type (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    notes text
);

insert into communication_type (name) values
('in person'),
('phone'),
('email'),
('SMS'),
('WhatsApp'),
('Telegram');

create table invitations (
    id uuid not null primary key default gen_random_uuid(),

    trip_id uuid not null references trips(id) on delete cascade,

    inviter_id uuid not null
        references travelers(id) on delete cascade,

    invitee_id uuid
        references travelers(id) on delete set null,

    invite_token text not null unique,
    access_code varchar(8) not null unique,

    first_name varchar(100),
    last_name varchar(100),
    email varchar(255),
    phone varchar(50),

    created_at timestamptz not null default now(),
    expires_at timestamptz not null,

    accepted_at timestamptz,
    refused_at timestamptz,
    sent_at timestamptz,

    communication_type varchar(100),
    notes text,

    constraint ch_invitations_dates check (

        /* 1. Expiration must always be after creation */
        expires_at > created_at

        /* 2. If invitation was sent → sent_at must not be earlier than creation */
        and (
            sent_at is null
            or sent_at >= created_at
        )

        /* 3. If invitation was accepted → accepted_at must:
              - be after creation,
              - be before expiration,
              - be after sent_at (if sent_at exists)
        */
        and (
            accepted_at is null
            or (
                accepted_at >= created_at
                and accepted_at <= expires_at
                and (
                    sent_at is null
                    or accepted_at >= sent_at
                )
            )
        )

        /* 4. If invitation was refused → refused_at must:
              - be after creation,
              - be before expiration,
              - be after sent_at (if sent_at exists)
        */
        and (
            refused_at is null
            or (
                refused_at >= created_at
                and refused_at <= expires_at
                and (
                    sent_at is null
                    or refused_at >= sent_at
                )
            )
        )

        /* 5. accepted_at and refused_at cannot both exist */
        and not (
            accepted_at is not null
            and refused_at is not null
        )
    )
);

create table trip_travelers (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    traveler_id uuid not null references travelers(id) on delete cascade,
    access_code varchar(8) not null,
);
create unique index idx_trip_travelers_trip_id_traveler_id on trip_travelers(trip_id, traveler_id);

create table trip_things (
    id uuid not null primary key default gen_random_uuid(),
    trip_traveler_id uuid not null references trip_travelers(id) on delete cascade,
    -- thing_id uuid not null references things(id) on delete cascade,
    -- package_id uuid null references packages(id) on delete set null,
    -- json contains thing and package data
    version integer not null default 1 check (version > 0),
    json_object jsonb not null
);
create index idx_trip_things_trip_traveler_id on trip_things(trip_traveler_id);

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
    from package_categories
    where id = new.category_id;

    if cat_trav is null then
        perform raise_integrity_error('Package refers to non-existing category');
    end if;

    -- Проверка nested-package (parent_package_id)
    if new.parent_package_id is not null then
        select pc.traveler_id into parent_cat_trav
        from packages p
        join package_categories pc on pc.id = p.category_id
        where p.id = new.parent_package_id;

        if parent_cat_trav is distinct from cat_trav then
            perform raise_integrity_error('Package parent belongs to different traveler');
        end if;
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trg_packages_same_traveler
before insert or update on packages
for each row execute function trg_packages_same_traveler();


-- things → thing_categories → travelers
create or replace function trg_things_same_traveler()
returns trigger as $$
declare
    cat_trav uuid;
begin
    select traveler_id into cat_trav
    from thing_categories
    where id = new.category_id;

    if cat_trav is null then
        perform raise_integrity_error('Thing refers to non-existing category');
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trg_things_same_traveler
before insert or update on things
for each row execute function trg_things_same_traveler();

-- trip_travelers → travelers, trips
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
before insert or update on trip_travelers
for each row execute function trg_trip_travelers_valid();

-- trip_things → thing, package, trip_traveler → один traveler
create or replace function trg_trip_things_same_traveler()
returns trigger as $$
declare
    tt_trav uuid;
    thing_trav uuid;
    pkg_trav uuid;
begin
    -- Traveler of trip_traveler
    select traveler_id into tt_trav
    from trip_travelers
    where id = new.trip_traveler_id;

    if tt_trav is null then
        perform raise_integrity_error('trip_things refers to nonexistent trip_traveler');
    end if;

    -- Traveler of thing
    select tc.traveler_id into thing_trav
    from things t
    join thing_categories tc on tc.id = t.category_id
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
        from packages p
        join package_categories pc on pc.id = p.category_id
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
before insert or update on trip_things
for each row execute function trg_trip_things_same_traveler();
