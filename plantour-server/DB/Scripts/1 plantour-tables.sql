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
('Preparation'),
('Active'),
('Completed');


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
-- ACTIVITIES
-----------------------------------------------------------------------
create table activities (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    notes text not null
);

-----------------------------------------------------------------------
-- GENDERS
-----------------------------------------------------------------------
create table genders (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    notes text null
);
insert into genders (name) values
('Male'),('Female'),('Unisex');

-----------------------------------------------------------------------
-- TEMPERATURE RANGES
-----------------------------------------------------------------------
create table temperature_ranges (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    fromTemp int null,
    toTemp int null check(toTemp >= fromTemp),
    notes text null
);
insert into temperature_ranges (name, fromTemp, toTemp) values
('Extreme Heat', 31, null),
('Warm', 21, 30),
('Mild', 11, 20),
('Cool', 1, 10),
('Cold', -10, 0),
('Extreme Cold', null, -11);

-----------------------------------------------------------------------
-- AGE RANGES
-----------------------------------------------------------------------
create table age_ranges (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    fromAge int not null check(fromAge >= 0),
    toAge int null check(toAge >= fromAge),
    notes text null
);
insert into age_ranges (name, fromAge, toAge) values
('Children', 0, 18),
('Early Adulthood', 18, 24),
('Prime Youth', 25, 34),
('Middle Youth', 35, 44),
('Early Seniority', 55, 64),
('Seniority', 65, null);


-----------------------------------------------------------------------
-- THING TEMPLATES
-----------------------------------------------------------------------
create table thing_templates (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    activity_id uuid not null references activities(id) on delete cascade,
    temperature_ranges_id uuid null references temperature_ranges(id) on delete cascade,
    age_ranges_id uuid null references age_ranges(id) on delete cascade,
    notes text null
);

create table template_things (
    id uuid not null primary key default gen_random_uuid(),
    template_id uuid not null references thing_templates(id) on delete cascade,
    category varchar(50),
    name varchar(200) not null unique,
    units varchar(50),
    value decimal(10,3) check(value > 0),
    notes text
);

CREATE OR REPLACE VIEW v_template_things_full AS
SELECT 
    tt.id AS thing_id,
    tt.name AS thing_name,
    tt.category,
    tt.units,
    tt.value,
    tt.notes AS thing_notes,

    tpl.id AS template_id,
    tpl.name AS template_name,

    act.name AS activity_name,

    tr.name AS temperature_range_name,
    tr.fromtemp,
    tr.totemp,

    ar.name AS age_range_name,
    ar.fromage,
    ar.toage

FROM template_things tt
JOIN thing_templates tpl ON tt.template_id = tpl.id
JOIN activities act ON tpl.activity_id = act.id
LEFT JOIN temperature_ranges tr ON tpl.temperature_ranges_id = tr.id
LEFT JOIN age_ranges ar ON tpl.age_ranges_id = ar.id;


-----------------------------------------------------------------------
-- USER ACCESS STATUS
-----------------------------------------------------------------------
create table access_types (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    notes text null
);

insert into access_types (name) values
('Pending'),
('Active'),
('Suspended'),
('Banned'),
('Archived');


-----------------------------------------------------------------------
-- TRANSACTION TYPE
-----------------------------------------------------------------------
create table transaction_types (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    notes text null
);
insert into transaction_types (name) values
('Payment'),
('SubscriptionFee'),
('Refund'),
('Bonus');

-----------------------------------------------------------------------
-- PLAN
-----------------------------------------------------------------------
create table plans (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    notes text null
);
insert into plans (name) values
('NoPlan'),
('Guest'),
('Trial'),
('Company'),
('Expedition');

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
    notes text,
    created_at timestamptz not null default now(),
    discount int not null check(discount >= 0) default 0,
    plan_id uuid not null references plans(id),
    access_type_id uuid not null references access_types(id)
);


create table transactions (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    transaction_type_id uuid not null references transaction_types(id),
    amount bigint not null,
    notes text,
    created_at timestamptz not null default now()
);

create table admins_participants (
    id uuid not null primary key default gen_random_uuid(),
    admin_id uuid not null references users(id) on delete cascade,
    participant_id uuid not null references users(id) on delete cascade,
    access_code_hash char(64) not null unique,
    notes text
);
create unique index idx_admins_participants_admin_id_participant_id on admins_participants(admin_id, participant_id);

-----------------------------------------------------------------------
-- USER THINGS
-----------------------------------------------------------------------
create table user_things (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    category varchar(50),
    name varchar(200) not null,
    units varchar(50),
    value decimal(10,3) check(value > 0),
    shared boolean not null default false,
    notes text
);
create unique index idx_user_things_user_id_name on user_things(user_id, name);

-----------------------------------------------------------------------
-- USER PACKAGES
-----------------------------------------------------------------------
create table user_packages (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    name varchar(200) not null,
    notes text
);
create unique index idx_user_packages_user_id_name on user_packages(user_id, name);


-----------------------------------------------------------------------
-- TRIPS
-----------------------------------------------------------------------
create table trips (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    trip_status_id uuid not null references trip_status(id),
    name varchar(200) not null,
    notes text,
    start_date date,
    end_date date,
    constraint ch_trips_start_before_end check (
        start_date is null 
        or end_date is null 
        or start_date <= end_date
    )
);
create unique index idx_trips_user_id_name on trips(user_id, name);

-----------------------------------------------------------------------
-- INVITATIONS
-----------------------------------------------------------------------
create table invitations (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    access_code text,
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
    admin_participant_id uuid not null references admins_participants(id) on delete cascade,
    notes text
);
create unique index idx_trip_users_trip_id_user_id on trip_users(trip_id, admin_participant_id);

-----------------------------------------------------------------------
-- TRIP USER PACKAGES
-----------------------------------------------------------------------
create table trip_user_packages (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    name varchar(200) not null,
    label varchar(100),
    notes text,
    packing_list_included boolean not null default(false),
    weight_value decimal(10,3) check(weight_value > 0),
    weight_unit varchar(50)
);
create unique index idx_trip_user_packages_trip_user_id_name on trip_user_packages(trip_user_id, name);

-----------------------------------------------------------------------
-- TRIP USER THINGS
-----------------------------------------------------------------------
create table trip_user_things (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    category varchar(50),      
    name varchar(200) not null,
    units varchar(50),
    value decimal(10,3) check(value > 0),
    notes text,
    trip_user_package_id uuid references trip_user_packages(id) on delete set null,
    finished_at timestamptz,
    finished text null check (finished in ('success', 'failure') or finished is null)
);
create unique index idx_trip_user_things_trip_user_id_name on trip_user_things(trip_user_id, name);

-----------------------------------------------------------------------
-- TRIP SHARED THINGS
-----------------------------------------------------------------------
create table trip_shared_things (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    category varchar(50),      
    name varchar(200) not null,
    units varchar(50),
    value decimal(10,3) check(value > 0),
    notes text,

    assigned_to_id uuid null references trip_users(id) on delete set null,
    assigned_thing_id uuid null references trip_user_things(id) on delete set null,
    assigned_at timestamptz null,
    assigned_deadline timestamptz null,
    rejected boolean not null default false
);
create unique index idx_trip_shared_things_trip_id_name on trip_shared_things(trip_id, name);

-----------------------------------------------------------------------
-- TRIP COMMENTS
-----------------------------------------------------------------------
create table trip_comments (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    -- admin if null
    trip_user_id uuid null references trip_users(id) on delete cascade,
    comment text not null,
    published_at timestamptz not null
);
create index idx_trip_comments_trip_id on trip_comments(trip_id);

-----------------------------------------------------------------------
-- USER EMAIL CONFIRMATIONS
-----------------------------------------------------------------------
create table user_email_confirmations (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    confirmed_at timestamptz null,
    last_sent_at timestamptz null
);
create unique index idx_user_email_confirmations_user_id on user_email_confirmations(user_id);

-----------------------------------------------------------------------
-- USER REFRESH TOKENS
-----------------------------------------------------------------------
create table user_refresh_tokens (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    role varchar(50) not null,
    admin_id uuid not null,
    token_hash varchar(256) not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    revoked_at timestamptz null,
    replaced_by_token_hash varchar(256) null,
    created_by_ip varchar(100) null,
    revoked_by_ip varchar(100) null
);
create unique index idx_user_refresh_tokens_user_token_hash on user_refresh_tokens(user_id, token_hash);
create index idx_user_refresh_tokens_token_hash on user_refresh_tokens(token_hash);
create index idx_user_refresh_tokens_user_id on user_refresh_tokens(user_id);
