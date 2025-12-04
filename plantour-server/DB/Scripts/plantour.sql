drop schema if exists plantour cascade;

create schema plantour;

set search_path to plantour, public;

-----------------------------------------------------------------------
-- COMMUNICATION TYPES
-----------------------------------------------------------------------
create table communication_types (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
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
-- UNITS
-----------------------------------------------------------------------
create table units (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique
);
insert into units (name) values
('pcs'),
('kg'),
('g'),
('lb'),
('oz'),
('L'),
('ml'),
('m'),
('cm'),
('in');

-----------------------------------------------------------------------
-- TRIP STATUS
-----------------------------------------------------------------------
create table trip_status (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
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
    name varchar(50) not null unique,
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

create table participant_status (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    notes text
);

insert into participant_status (name) values
('Planned'),
('Invited'),
('Active'),
('Excluded');

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
    participant_status_id uuid references participant_status(id),
    access_code varchar(8) not null unique
);
create unique index idx_admins_participants on admins_participants(admin_id, participant_id);

create table refresh_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    token varchar(500) not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone not null default now(),
    revoked_at timestamp with time zone null,
    replaced_by_token varchar(500) null
);
create index idx_refresh_tokens_user_id on refresh_tokens(user_id);

-----------------------------------------------------------------------
-- USER THINGS
-----------------------------------------------------------------------
create table user_things (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    category_id uuid null references thing_categories(id),
    name varchar(200) not null,
    description text,
    units_id uuid references units(id) -- pcs if null
);
create index idx_user_things_category_id on user_things(category_id);
create unique index idx_user_things_user_id_name on user_things(user_id, name);


-----------------------------------------------------------------------
-- USER PACKAGES
-----------------------------------------------------------------------
create table user_packages (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    category_id uuid null references package_categories(id),
    name varchar(200) not null,
    description text
);
create index idx_user_packages_category_id on user_packages(category_id);
create unique index idx_user_packages_user_id_name on user_packages(user_id, name);

-----------------------------------------------------------------------
-- TRIPS
-----------------------------------------------------------------------
create table trips (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid null references users(id) on delete cascade,
    trip_status varchar(50),
    name varchar(200) not null,
    description text,
    start_date date,
    end_date date,
    constraint ch_trips_start_before_end check (
        start_date is null 
        or end_date is null 
        or start_date <= end_date
    )
);
create index idx_trips_user_id on trips(user_id);

-----------------------------------------------------------------------
-- INVITATIONS
-----------------------------------------------------------------------
create table invitations (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    token text not null unique,
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

    communication_type varchar(50),

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
    user_id uuid not null references users(id) on delete cascade
);
create unique index idx_trip_users_trip_id_user_id on trip_users(trip_id, user_id);

-----------------------------------------------------------------------
-- TRIP USER PACKAGES
-----------------------------------------------------------------------
create table trip_user_packages (
    id uuid not null primary key default gen_random_uuid(),
    parent_package_id uuid references trip_user_packages(id) on delete set null,
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    
    category varchar(50),       -- to be copied from user_packages 
    name varchar(200) not null, -- to be copied from user_packages
    label varchar(100),

    packing_status varchar(50),
    packed_at timestamptz,
    packing_list_included boolean not null default(false),
    weight_value decimal(10,3) check(weight_value > 0),
    weight_unit varchar(50)
);
create index idx_trip_user_packages_trip_user_id on trip_user_packages(trip_user_id);

-----------------------------------------------------------------------
-- TRIP USER THINGS
-----------------------------------------------------------------------
create table trip_user_things (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,

    category varchar(50),       -- to be copied from user_things 
    name varchar(200) not null, -- to be copied from user_things 
    units varchar(50), -- pcs if null
    value decimal(10,3) check(value > 0), -- 1 if null

    trip_user_package_id uuid references trip_user_packages(id) on delete set null,

    packing_status varchar(50),
    packed_at timestamptz
);
create index idx_trip_user_things_trip_user_id on trip_user_things(trip_user_id);


