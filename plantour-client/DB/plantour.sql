drop schema if exists plantour cascade;

create schema plantour;

set search_path to plantour, public;


-----------------------------------------------------------------------
-- CURRENCIES
-----------------------------------------------------------------------

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


-----------------------------------------------------------------------
-- UNIT CATEGORIES
-----------------------------------------------------------------------

create table unit_categories (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    notes text
);


-----------------------------------------------------------------------
-- UNITS
-----------------------------------------------------------------------

create table units (
    id uuid not null primary key default gen_random_uuid(),
    unit_category_id uuid not null references unit_categories(id),
    name varchar(50) not null unique,
    abbreviation varchar(10) not null unique
);


-----------------------------------------------------------------------
-- POPULATE BASIC UNITS (WEIGHT / LENGTH / VOLUME)
-----------------------------------------------------------------------

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
BEGIN
    FOR category IN SELECT * FROM jsonb_array_elements(data)
    LOOP
        SELECT jsonb_object_keys(category) INTO category_name;

        units := category -> category_name;

        category_id := gen_random_uuid();

        INSERT INTO unit_categories (id, name)
        VALUES (category_id, category_name);

        FOR unit IN SELECT jsonb_array_elements_text(units)
        LOOP
            INSERT INTO units (id, unit_category_id, name, abbreviation)
            VALUES (gen_random_uuid(), category_id, unit, unit);
        END LOOP;
    END LOOP;
END $$;


-----------------------------------------------------------------------
-- TRIP STATUS
-----------------------------------------------------------------------

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


-----------------------------------------------------------------------
-- PACKING STATUS
-----------------------------------------------------------------------

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


-----------------------------------------------------------------------
-- TRAVELERS
-----------------------------------------------------------------------

create table travelers (
    id uuid not null primary key default gen_random_uuid(),

    user_id varchar(100) null unique,
    admin_id uuid null references travelers(id) on delete cascade,

    first_name varchar(100),
    last_name varchar(100),
    email varchar(255) null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone varchar(50),
    notes text,

    constraint ch_travelers_admin_user check (
        (admin_id is not null and user_id is null)
        or
        (admin_id is null and user_id is not null)
    )
);

create index idx_travelers_admin_id on travelers(admin_id);
create index idx_travelers_user_id on travelers(user_id);


-----------------------------------------------------------------------
-- TRAVELER THING CATEGORIES
-----------------------------------------------------------------------

create table traveler_thing_categories (
    id uuid not null primary key default gen_random_uuid(),
    traveler_id uuid not null references travelers(id) on delete cascade,
    name varchar(100) not null
);

create unique index idx_traveler_thing_categories_traveler_id_name
    on traveler_thing_categories(traveler_id, name);


-----------------------------------------------------------------------
-- TRAVELER THINGS
-----------------------------------------------------------------------

create table traveler_things (
    id uuid not null primary key default gen_random_uuid(),

    category_id uuid not null references traveler_thing_categories(id) on delete cascade,

    short_description varchar(200) not null,
    description text,
    brand varchar(100),
    model varchar(100),
    color varchar(50),

    weight_value decimal(10,3),
    weight_unit_id uuid references units(id),

    length_value decimal(10,2),
    width_value decimal(10,2),
    height_value decimal(10,2),
    dimension_unit_id uuid references units(id),

    purchase_date date,
    purchase_price decimal(10,2),
    purchase_currency_id uuid references currencies(id),

    -- weight_value <-> weight_unit_id
    constraint ch_things_weight_value_unit check (
        (weight_value is null and weight_unit_id is null)
        or
        (weight_value is not null and weight_unit_id is not null)
    ),

    -- all dimensions must be NULL or all NOT NULL with unit
    constraint ch_things_dimension_value_unit check (
        (
            length_value is null
            and width_value is null
            and height_value is null
            and dimension_unit_id is null
        )
        or
        (
            length_value is not null
            and width_value is not null
            and height_value is not null
            and dimension_unit_id is not null
        )
    )
);

create index idx_traveler_things_category_id on traveler_things(category_id);


-----------------------------------------------------------------------
-- TRAVELER PACKAGE CATEGORIES
-----------------------------------------------------------------------

create table traveler_package_categories (
    id uuid not null primary key default gen_random_uuid(),
    traveler_id uuid not null references travelers(id) on delete cascade,
    name varchar(50) not null,
    notes text
);

create unique index idx_traveler_package_categories_traveler_id_name
    on traveler_package_categories(traveler_id, name);


-----------------------------------------------------------------------
-- TRAVELER PACKAGES
-----------------------------------------------------------------------

create table traveler_packages (
    id uuid not null primary key default gen_random_uuid(),

    category_id uuid not null references traveler_package_categories(id) on delete cascade,
    parent_package_id uuid references traveler_packages(id) on delete set null,

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

    -- empty_weight_value <-> weight_unit_id
    constraint ch_packages_weight_value_unit check (
        (empty_weight_value is null and weight_unit_id is null)
        or
        (empty_weight_value is not null and weight_unit_id is not null)
    ),

    -- all dimensions NULL or all NOT NULL
    constraint ch_packages_dimension_value_unit check (
        (
            length_value is null
            and width_value is null
            and height_value is null
            and dimension_unit_id is null
        )
        or
        (
            length_value is not null
            and width_value is not null
            and height_value is not null
            and dimension_unit_id is not null
        )
    ),

    -- capacity_value <-> capacity_unit_id
    constraint ch_packages_capacity_value_unit check (
        (capacity_value is null and capacity_unit_id is null)
        or
        (capacity_value is not null and capacity_unit_id is not null)
    )
);

create index idx_traveler_packages_category_id on traveler_packages(category_id);
create index idx_traveler_packages_parent_package_id on traveler_packages(parent_package_id);


-----------------------------------------------------------------------
-- TRIPS
-----------------------------------------------------------------------

create table trips (
    id uuid not null primary key default gen_random_uuid(),

    owner_id uuid not null references travelers(id) on delete cascade,
    trip_status_id uuid references trip_status(id) on delete set null,

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

create index idx_trips_owner_id on trips(owner_id);


-----------------------------------------------------------------------
-- COMMUNICATION TYPES
-----------------------------------------------------------------------

create table communication_types (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    notes text
);

insert into communication_types (name) values
('in person'),
('phone'),
('email'),
('SMS'),
('WhatsApp'),
('Telegram');


-----------------------------------------------------------------------
-- INVITATIONS
-----------------------------------------------------------------------

create table invitations (
    id uuid not null primary key default gen_random_uuid(),

    trip_id uuid not null references trips(id) on delete cascade,
    inviter_id uuid not null references travelers(id) on delete cascade,
    invitee_id uuid not null references travelers(id) on delete cascade,

    invite_token text not null unique,
    access_code varchar(8) not null unique,

    first_name varchar(100),
    last_name varchar(100),
    email varchar(255),
    phone varchar(50),

    subject varchar(200) not null,
    message text not null,

    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    accepted_at timestamptz,
    refused_at timestamptz,
    sent_at timestamptz,

    communication_type_id uuid references communication_types(id) on delete set null,

    notes text,

    constraint ch_invitations_dates check (
        expires_at > created_at

        and (sent_at is null or sent_at >= created_at)

        and (
            accepted_at is null
            or (
                accepted_at >= created_at
                and accepted_at <= expires_at
                and (sent_at is null or accepted_at >= sent_at)
            )
        )

        and (
            refused_at is null
            or (
                refused_at >= created_at
                and refused_at <= expires_at
                and (sent_at is null or refused_at >= sent_at)
            )
        )

        and not (
            accepted_at is not null
            and refused_at is not null
        )
    )
);


-----------------------------------------------------------------------
-- TRIP TRAVELERS
-----------------------------------------------------------------------

create table trip_travelers (
    id uuid not null primary key default gen_random_uuid(),

    trip_id uuid not null references trips(id) on delete cascade,
    traveler_id uuid not null references travelers(id) on delete cascade,

    access_code varchar(8) not null unique
);

create unique index idx_trip_travelers_trip_id_traveler_id
    on trip_travelers(trip_id, traveler_id);


-----------------------------------------------------------------------
-- TRIP TRAVELER THINGS
-----------------------------------------------------------------------

create table trip_traveler_things (
    id uuid not null primary key default gen_random_uuid(),

    trip_traveler_id uuid not null references trip_travelers(id) on delete cascade,
    traveler_thing_id uuid not null references traveler_things(id) on delete cascade,
    traveler_package_id uuid references traveler_packages(id) on delete set null,

    packing_status_id uuid references packing_status(id) on delete set null,
    packed_at timestamptz
);

create unique index idx_trip_traveler_trip_traveler_id_traveler_thing_id
    on trip_traveler_things(trip_traveler_id, traveler_thing_id);


-----------------------------------------------------------------------
-- FUNCTIONS + TRIGGERS (UNIT CATEGORY VALIDATION)
-----------------------------------------------------------------------

create or replace function check_unit_category(
    unit_id uuid,
    expected_category text
)
returns void
language plpgsql
as $$
declare
    actual_category text;
begin
    if unit_id is null then
        return;
    end if;

    select uc.name into actual_category
    from units u
    join unit_categories uc on uc.id = u.unit_category_id
    where u.id = unit_id;

    if actual_category is null then
        raise exception 'Unknown unit id: %', unit_id;
    end if;

    if actual_category <> expected_category then
        raise exception 'Unit % belongs to category %, but expected %',
            unit_id, actual_category, expected_category;
    end if;
end;
$$;


create or replace function trg_check_traveler_things_units()
returns trigger
language plpgsql
as $$
begin
    -- Weight must be from 'weight' category
    if NEW.weight_unit_id is not null then
        perform check_unit_category(NEW.weight_unit_id, 'weight');
    end if;

    -- Dimensions must be from 'length' category
    if NEW.dimension_unit_id is not null then
        perform check_unit_category(NEW.dimension_unit_id, 'length');
    end if;

    return NEW;
end;
$$;

create trigger trg_traveler_things_units
before insert or update on traveler_things
for each row
execute function trg_check_traveler_things_units();


create or replace function trg_check_traveler_packages_units()
returns trigger
language plpgsql
as $$
begin
    -- Weight must be from 'weight' category
    if NEW.weight_unit_id is not null then
        perform check_unit_category(NEW.weight_unit_id, 'weight');
    end if;

    -- Dimensions must be from 'length' category
    if NEW.dimension_unit_id is not null then
        perform check_unit_category(NEW.dimension_unit_id, 'length');
    end if;

    -- Capacity must be from 'volume' category
    if NEW.capacity_unit_id is not null then
        perform check_unit_category(NEW.capacity_unit_id, 'volume');
    end if;

    return NEW;
end;
$$;

create trigger trg_traveler_packages_units
before insert or update on traveler_packages
for each row
execute function trg_check_traveler_packages_units();


-----------------------------------------------------------------------
-- FUNCTIONS + TRIGGERS (TRAVELER CONSISTENCY)
-----------------------------------------------------------------------

create or replace function get_traveler_id_for_thing(_thing_id uuid)
returns uuid
language sql
as $$
    select ttc.traveler_id
    from traveler_things tt
    join traveler_thing_categories ttc on ttc.id = tt.category_id
    where tt.id = _thing_id
$$;


create or replace function get_traveler_id_for_package(_package_id uuid)
returns uuid
language sql
as $$
    select tpc.traveler_id
    from traveler_packages tp
    join traveler_package_categories tpc on tpc.id = tp.category_id
    where tp.id = _package_id
$$;


create or replace function get_traveler_id_for_trip_traveler(_trip_traveler_id uuid)
returns uuid
language sql
as $$
    select traveler_id
    from trip_travelers
    where id = _trip_traveler_id
$$;


create or replace function check_same_traveler(
    tt_traveler uuid,
    thing_traveler uuid,
    package_traveler uuid
)
returns void
language plpgsql
as $$
begin
    -- traveler_thing_id must belong to same traveler
    if thing_traveler is not null and thing_traveler <> tt_traveler then
        raise exception 'traveler_thing_id belongs to traveler %, but trip_traveler is for traveler %',
            thing_traveler, tt_traveler;
    end if;

    -- traveler_package_id must belong to same traveler
    if package_traveler is not null and package_traveler <> tt_traveler then
        raise exception 'traveler_package_id belongs to traveler %, but trip_traveler is for traveler %',
            package_traveler, tt_traveler;
    end if;
end;
$$;


create or replace function trg_check_trip_traveler_things()
returns trigger
language plpgsql
as $$
declare
    tt_traveler uuid;
    thing_traveler uuid;
    package_traveler uuid;
begin
    -- owner of trip_traveler
    tt_traveler := get_traveler_id_for_trip_traveler(NEW.trip_traveler_id);

    -- owner of traveler_thing
    thing_traveler := get_traveler_id_for_thing(NEW.traveler_thing_id);

    -- owner of traveler_package (nullable)
    if NEW.traveler_package_id is not null then
        package_traveler := get_traveler_id_for_package(NEW.traveler_package_id);
    end if;

    -- Check consistency
    perform check_same_traveler(tt_traveler, thing_traveler, package_traveler);

    return NEW;
end;
$$;


create trigger trg_trip_traveler_things_check
before insert or update on trip_traveler_things
for each row
execute function trg_check_trip_traveler_things();


create or replace function get_trip_dates(_trip_traveler_id uuid)
returns table(start_date date, end_date date)
language sql
as $$
    select t.start_date, t.end_date
    from trip_travelers tt
    join trips t on t.id = tt.trip_id
    where tt.id = _trip_traveler_id
$$;


create or replace function trg_check_trip_traveler_things_packing()
returns trigger
language plpgsql
as $$
declare
    _status text;
    trip_start date;
    trip_end date;
begin
    --------------------------------------------------------------------
    -- Load packing status name
    --------------------------------------------------------------------
    if NEW.packing_status_id is not null then
        select name into _status
        from packing_status
        where id = NEW.packing_status_id;
    else
        _status := null;
    end if;

    --------------------------------------------------------------------
    -- Load trip dates
    --------------------------------------------------------------------
    select start_date, end_date
    into trip_start, trip_end
    from get_trip_dates(NEW.trip_traveler_id);

    --------------------------------------------------------------------
    -- Rule 1: Planning / Active prohibit packed_at
    --------------------------------------------------------------------
    if _status in ('Planning', 'Active') then
        if NEW.packed_at is not null then
            raise exception
                'packing_status = % prohibits packed_at', _status;
        end if;
    end if;

    --------------------------------------------------------------------
    -- Rule 2: Completed / Verified allow packed_at to be NULL or NOT NULL
    -- BUT if packed_at IS NOT NULL, it must be valid
    --------------------------------------------------------------------
    if _status in ('Completed', 'Verified') then
        if NEW.packed_at is not null then

            -- packed_at cannot be before trip.start_date
            if trip_start is not null and NEW.packed_at::date < trip_start then
                raise exception
                    'packed_at % cannot be earlier than trip start_date %',
                    NEW.packed_at, trip_start;
            end if;

            -- packed_at cannot be after trip.end_date
            if trip_end is not null and NEW.packed_at::date > trip_end then
                raise exception
                    'packed_at % cannot be later than trip end_date %',
                    NEW.packed_at, trip_end;
            end if;

        end if;
    end if;

    --------------------------------------------------------------------
    -- Rule 3: If packed_at is NOT NULL, status must be Completed/Verified
    --------------------------------------------------------------------
    if NEW.packed_at is not null then
        if _status not in ('Completed', 'Verified') then
            raise exception
                'packed_at is allowed only when packing_status is Completed or Verified';
        end if;
    end if;

    return NEW;
end;
$$;

create trigger trg_trip_traveler_things_packing_check
before insert or update on trip_traveler_things
for each row
execute function trg_check_trip_traveler_things_packing();
