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

insert into thing_categories (name) values
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
    category_id uuid null references thing_categories(id) on delete set null,
    short_description varchar(200) not null,
    description text
);

create index idx_user_things_category_id on user_things(category_id);
create unique index idx_user_things_user_id_short_description on user_things(user_id, short_description);


-----------------------------------------------------------------------
-- USER PACKAGES
-----------------------------------------------------------------------
create table user_packages (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    category_id uuid null references package_categories(id) on delete set null,
    short_description varchar(200) not null,
    description text
);

create index idx_user_packages_category_id on user_packages(category_id);
create unique index idx_user_packages_user_id_short_description on user_packages(user_id, short_description);


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
    parent_package_id uuid references trip_user_packages(id) on delete set null,

    packing_status_id uuid references packing_status(id) on delete set null,
    packed_at timestamptz,
    label varchar(100),
    packing_list_included boolean not null default(false),
    weight_value decimal(10,3),
    weight_unit_id uuid references units(id)
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

