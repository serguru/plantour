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
-- USER PACKAGE CATEGORIES
-----------------------------------------------------------------------

create table package_categories (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    notes text
);

insert into package_categories (name) values
('Suitcase'),
('Bag'),
('Backpack'),
('Plastic bag'),
('Wrapper'),
('Carry on'),
('Box');

create table thing_categories (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    notes text
);

insert into package_categories (name) values
('Accessories'),
('Baby & Kids'),
('Clothing'),
('Documents'),
('Electronics'),
('Emergency & First Aid'),
('Footwear'),
('Food & Snacks'),
('Health & Hygiene'),
('Laundry'),
('Medicine'),
('Outdoor & Sports'),
('Personal Care'),
('Pets'),
('Toiletries'),
('Travel Essentials');



-----------------------------------------------------------------------
-- USERS
-----------------------------------------------------------------------

create table users (
    id uuid not null primary key default gen_random_uuid(),
    email varchar(255) not null unique check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash bytea null,
    password_salt bytea null,
    first_name varchar(100),
    last_name varchar(100),
    phone varchar(50),
    notes text
);

create table admins_participants (
    id uuid not null primary key default gen_random_uuid(),
    admin_id uuid not null references users(id) on delete cascade,
    participant_id uuid not null references users(id) on delete cascade,
    access_code varchar(8) not null unique
);
create index idx_admins_participants_admin_id on admins_participants(admin_id);
create index idx_admins_participants_participant_id on admins_participants(participant_id);


create table refresh_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    token varchar(500) not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone not null default now(),
    revoked_at timestamp with time zone null,
    replaced_by_token varchar(500) null,
    constraint fk_refresh_tokens_user foreign key (user_id) 
        references plantour.users(id) on delete cascade
);

create index idx_refresh_tokens_user_id on refresh_tokens(user_id);
create index idx_refresh_tokens_token on refresh_tokens(token);

-----------------------------------------------------------------------
-- USER THINGS
-----------------------------------------------------------------------

create table user_things (
    id uuid not null primary key default gen_random_uuid(),

    user_id uuid not null references users(id) on delete cascade,
    category_id uuid null references thing_categories(id) on delete cascade,

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

create index idx_user_things_category_id on user_things(category_id);


-----------------------------------------------------------------------
-- USER PACKAGES
-----------------------------------------------------------------------

create table user_packages (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    category_id uuid null references package_categories(id) on delete set null,
    parent_package_id uuid references user_packages(id) on delete set null,

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

create index idx_user_packages_category_id on user_packages(category_id);
create index idx_user_packages_parent_package_id on user_packages(parent_package_id);


-----------------------------------------------------------------------
-- TRIPS
-----------------------------------------------------------------------

create table trips (
    id uuid not null primary key default gen_random_uuid(),

    owner_id uuid not null references users(id) on delete cascade,
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
    inviter_id uuid not null references users(id) on delete cascade,
    invitee_id uuid not null references users(id) on delete cascade,

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
-- TRIP USERS
-----------------------------------------------------------------------

create table trip_users (
    id uuid not null primary key default gen_random_uuid(),

    trip_id uuid not null references trips(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,

    access_code varchar(8) not null unique
);

create unique index idx_trip_users_trip_id_user_id
    on trip_users(trip_id, user_id);


-----------------------------------------------------------------------
-- TRIP USER PACKAGES
-----------------------------------------------------------------------

create table trip_user_packages (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    user_package_id uuid references user_packages(id) on delete set null,
    packing_status_id uuid references packing_status(id) on delete set null,
    packed_at timestamptz,
    label varchar(100),
    packing_list_included boolean not null default(false)
);

create unique index idx_trip_user_packages_trip_user_id_user_package_id
    on trip_user_packages(trip_user_id, user_package_id);



-----------------------------------------------------------------------
-- TRIP USER THINGS
-----------------------------------------------------------------------

create table trip_user_things (
    id uuid not null primary key default gen_random_uuid(),

    trip_user_id uuid not null references trip_users(id) on delete cascade,
    user_thing_id uuid not null references user_things(id) on delete cascade,
    trip_user_package_id uuid references trip_user_packages(id) on delete set null,
    qty integer not null check(qty > 0) default 1,
    packing_status_id uuid references packing_status(id) on delete set null,
    packed_at timestamptz
);

create unique index idx_trip_user_trip_user_id_user_thing_id
    on trip_user_things(trip_user_id, user_thing_id);


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


create or replace function trg_check_user_things_units()
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

create trigger trg_user_things_units
before insert or update on user_things
for each row
execute function trg_check_user_things_units();


create or replace function trg_check_user_packages_units()
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

create trigger trg_user_packages_units
before insert or update on user_packages
for each row
execute function trg_check_user_packages_units();


-----------------------------------------------------------------------
-- FUNCTIONS + TRIGGERS (USER CONSISTENCY)
-----------------------------------------------------------------------

create or replace function get_user_id_for_thing(_thing_id uuid)
returns uuid
language sql
as $$
    select tt.user_id
    from user_things tt
    where tt.id = _thing_id
$$;


create or replace function get_user_id_for_package(_package_id uuid)
returns uuid
language sql
as $$
    select tp.user_id
    from user_packages tp
    where tp.id = _package_id
$$;


create or replace function get_user_id_for_trip_user(_trip_user_id uuid)
returns uuid
language sql
as $$
    select user_id
    from trip_users
    where id = _trip_user_id
$$;


create or replace function check_same_user(
    tt_user uuid,
    thing_user uuid,
    package_user uuid
)
returns void
language plpgsql
as $$
begin
    -- user_thing_id must belong to same user
    if thing_user is not null and thing_user <> tt_user then
        raise exception 'user_thing_id belongs to user %, but trip_user is for user %',
            thing_user, tt_user;
    end if;

    -- user_package_id must belong to same user
    if package_user is not null and package_user <> tt_user then
        raise exception 'user_package_id belongs to user %, but trip_user is for user %',
            package_user, tt_user;
    end if;
end;
$$;


create or replace function trg_check_trip_user_things()
returns trigger
language plpgsql
as $$
declare
    tt_user uuid;
    thing_user uuid;
    package_user uuid;
begin
    -- owner of trip_user
    tt_user := get_user_id_for_trip_user(NEW.trip_user_id);

    -- owner of user_thing
    thing_user := get_user_id_for_thing(NEW.user_thing_id);

    -- owner of user_package (nullable)
    if NEW.user_package_id is not null then
        package_user := get_user_id_for_package(NEW.user_package_id);
    end if;

    -- Check consistency
    perform check_same_user(tt_user, thing_user, package_user);

    return NEW;
end;
$$;


create trigger trg_trip_user_things_check
before insert or update on trip_user_things
for each row
execute function trg_check_trip_user_things();


create or replace function get_trip_dates(_trip_user_id uuid)
returns table(start_date date, end_date date)
language sql
as $$
    select t.start_date, t.end_date
    from trip_users tt
    join trips t on t.id = tt.trip_id
    where tt.id = _trip_user_id
$$;


create or replace function trg_check_trip_user_things_packing()
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
    from get_trip_dates(NEW.trip_user_id);

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

create trigger trg_trip_user_things_packing_check
before insert or update on trip_user_things
for each row
execute function trg_check_trip_user_things_packing();
