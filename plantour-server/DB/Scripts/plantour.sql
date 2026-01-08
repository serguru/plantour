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

create table participant_statuses (
    id uuid not null primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    notes text
);

insert into participant_statuses (name) values
('Planned'),
('Invited'),
('Active'),
('Excluded');

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
    name varchar(200) not null,
    units varchar(50),
    value decimal(10,3) check(value > 0),
    notes text
);
create unique index idx_template_things_template_id_name on template_things(template_id, name);



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
    participant_status_id uuid not null references participant_statuses(id),
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
    packed_at timestamptz,
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
    rejected boolean not null default false,
    constraint ch_trip_shared_things_at_before_deadline check (
        assigned_at is null 
        or assigned_deadline is null 
        or assigned_at <= assigned_deadline
    )
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

create or replace function plantour.get_trip_user_id(
    p_admin_id uuid,
    p_participant_id uuid,
    p_trip_id uuid
)
returns uuid
language plpgsql
as $$
declare
    v_trip_user_id uuid;
begin
    select a.id
    into v_trip_user_id
    from plantour.trip_users a
    join plantour.admins_participants b on b.id = a.admin_participant_id
    join plantour.trips t on t.id = a.trip_id
    where
        t.id = p_trip_id
        and t.user_id = p_admin_id
        and b.admin_id = p_admin_id
        and b.participant_id = p_participant_id;

    if v_trip_user_id is null then
        raise exception
            'TripUser not found for admin %, participant %, trip %',
            p_admin_id, p_participant_id, p_trip_id;
    end if;

    return v_trip_user_id;
end;
$$;

create or replace function plantour.get_trip_id(
    p_admin_id uuid,
    p_trip_id uuid
)
returns void
language plpgsql
as $$
declare
    v_trip_id uuid;
begin
    select id
    into v_trip_id
    from plantour.trips
    where
        id = p_trip_id
        and user_id = p_admin_id;

    if v_trip_id is null then
        raise exception
            'Trip not found for current admin';
    end if;
end;
$$;

-- select plantour.insert_trip_user_packages(
--     '',
--     '',
--     '',
--     array[
--         '',
--         ''
--     ]::uuid[]
-- );

create or replace function plantour.insert_trip_user_packages(
    p_admin_id uuid,
    p_participant_id uuid,
    p_trip_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_trip_user_id uuid;
    v_inserted_count integer;
begin

    select plantour.get_trip_user_id(
        p_admin_id,
        p_participant_id,
        p_trip_id
    )
    into v_trip_user_id;

    insert into plantour.trip_user_packages (trip_user_id, name)
    select
        v_trip_user_id,
        b.name
    from plantour.user_packages b
    left join plantour.trip_user_packages c on 
        c.trip_user_id = v_trip_user_id and 
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        b.id = any (p_ids)
        and b.user_id = p_participant_id
        and c.id is null;

    get diagnostics v_inserted_count = row_count;

    return v_inserted_count;
end;
$$;

create or replace function plantour.delete_trip_user_packages(
    p_admin_id uuid,
    p_participant_id uuid,
    p_trip_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_trip_user_id uuid;
    v_deleted_count integer;
begin

    select plantour.get_trip_user_id(
        p_admin_id,
        p_participant_id,
        p_trip_id
    )
    into v_trip_user_id;

    delete from plantour.trip_user_packages a
    using plantour.user_packages b
    join plantour.trip_user_packages c on 
        c.trip_user_id = v_trip_user_id and 
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        a.id = c.id and
        b.id = any (p_ids)
        and b.user_id = p_participant_id;

    get diagnostics v_deleted_count = row_count;

    return v_deleted_count;
end;
$$;


create or replace function plantour.insert_trip_user_things(
    p_admin_id uuid,
    p_participant_id uuid,
    p_trip_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_trip_user_id uuid;
    v_inserted_count integer;
begin

    select plantour.get_trip_user_id(
        p_admin_id,
        p_participant_id,
        p_trip_id
    )
    into v_trip_user_id;

    insert into plantour.trip_user_things (trip_user_id, name)
    select
        v_trip_user_id,
        b.name
    from plantour.user_things b
    left join plantour.trip_user_things c on 
        c.trip_user_id = v_trip_user_id and 
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        b.id = any (p_ids)
        and b.user_id = p_participant_id
        and c.id is null;

    get diagnostics v_inserted_count = row_count;

    return v_inserted_count;
end;
$$;

create or replace function plantour.delete_trip_user_things(
    p_admin_id uuid,
    p_participant_id uuid,
    p_trip_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_trip_user_id uuid;
    v_deleted_count integer;
begin

    select plantour.get_trip_user_id(
        p_admin_id,
        p_participant_id,
        p_trip_id
    )
    into v_trip_user_id;

    delete from plantour.trip_user_things a
    using plantour.user_things b
    join plantour.trip_user_things c on 
        c.trip_user_id = v_trip_user_id and 
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        a.id = c.id and
        b.id = any (p_ids)
        and b.user_id = p_participant_id;

    get diagnostics v_deleted_count = row_count;

    return v_deleted_count;
end;
$$;

create or replace function plantour.insert_trip_users(
    p_admin_id uuid,
    p_trip_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_inserted_count integer;
begin
    -- Exception will be raised if trip not found or not owned by admin
    perform plantour.get_trip_id(p_admin_id, p_trip_id);

    insert into plantour.trip_users (trip_id, admin_participant_id)
    select p_trip_id, b.id
    from plantour.admins_participants b
    left join plantour.trip_users c on b.id = c.admin_participant_id and c.trip_id = p_trip_id
    where
        b.id = any (p_ids)
        and b.admin_id = p_admin_id
        and c.id is null;        

    get diagnostics v_inserted_count = row_count;

    return v_inserted_count;
end;
$$;

create or replace function plantour.delete_trip_users(
    p_admin_id uuid,
    p_trip_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_deleted_count integer;
begin
    -- Exception will be raised if trip not found or not owned by admin
    perform plantour.get_trip_id(p_admin_id, p_trip_id);

    delete from plantour.trip_users a
    where
        a.trip_id = p_trip_id and
        a.admin_participant_id = any (p_ids);

    get diagnostics v_deleted_count = row_count;

    return v_deleted_count;
end;
$$;

create or replace function plantour.pack_trip_things(
    p_admin_id uuid,
    p_participant_id uuid,
    p_trip_id uuid,
    p_package_id uuid,
    p_ids uuid[],
    p_unpack boolean
)
returns integer
language plpgsql
as $$
declare
    v_updated_count integer;
    v_admins_participant_id uuid;
    v_trip_user_id uuid;
begin
    -- Exception will be raised if trip not found or not owned by admin
    perform plantour.get_trip_id(p_admin_id, p_trip_id);

    -- The participant must be linked to the admin
    select id
    into v_admins_participant_id
    from plantour.admins_participants
    where
        admin_id = p_admin_id
        and participant_id = p_participant_id;

    if v_admins_participant_id is null then
        raise exception
            'Admin participant relation not found';
    end if;

    -- The participant must be linked to the trip
    select id
    into v_trip_user_id
    from plantour.trip_users
    where
        admin_participant_id = v_admins_participant_id
        and trip_id = p_trip_id;

    if v_admins_participant_id is null then
        raise exception
            'Trip user for participant not found';
    end if;


    if (p_unpack) then
        update plantour.trip_user_things
        set 
            finished_at = null, 
            finished = null,
            trip_user_package_id = null
        where
            trip_user_id = v_trip_user_id and
            id = any (p_ids);

    else            

        if not exists (
            select null from plantour.trip_user_packages where id = p_package_id and trip_user_id = v_trip_user_id
        ) then
            raise exception
                'Wrong pack id';
        end if;

        update plantour.trip_user_things
        set 
            finished_at = now(), 
            finished = 'success',
            trip_user_package_id = p_package_id
        where
            trip_user_id = v_trip_user_id and
            id = any (p_ids);

    end if;


    get diagnostics v_updated_count = row_count;

    return v_updated_count;
end;
$$;


create or replace function plantour.insert_trip_shared_things(
    p_admin_id uuid,
    p_trip_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_trip_user_id uuid;
    v_inserted_count integer;
begin
    insert into plantour.trip_shared_things (trip_id, category, name, units, value)
    select
        p_trip_id,
        b.category,
        b.name,
        b.units,
        b.value
    from plantour.user_things b
    left join plantour.trip_shared_things c on 
        c.trip_id = p_trip_id and 
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        b.id = any (p_ids)
        and b.user_id = p_admin_id
        and c.id is null;

    get diagnostics v_inserted_count = row_count;

    return v_inserted_count;
end;
$$;

create or replace function plantour.delete_trip_shared_things(
    p_admin_id uuid,
    p_trip_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_deleted_count integer;
begin
    delete from plantour.trip_shared_things a
    using plantour.user_things b
    join plantour.trip_shared_things c on 
        c.trip_id = p_trip_id and 
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        a.id = c.id 
        and b.id = any (p_ids)
        and b.user_id = p_admin_id;

    get diagnostics v_deleted_count = row_count;

    return v_deleted_count;
end;
$$;



-- ====================================================================
-- USERS (2 admins + 2 participants + 2 extra users)
-- ====================================================================
INSERT INTO users (email, password_hash, password_salt, first_name, last_name, phone, notes)
VALUES
    (
        'serguru@gmail.com',
        '\x35c846498f41a7ed1513b765c264ab222f7c3b015163fc07c78f6af00554436d2bb8f3d105a848584a0103f228132affc301505136188d50194e14f9a32d0f64',
        '\x727465da121430b0bf747ea4a4cc3c21f458c61b824b15d354fc8e10adb5d2a7e82a3aa26363d48178341995f078275e2d5b3c5df70536c6af73a6dff32e15b7',
        'Serge',
        'Cherny',
        '+1-604-000-0000',
        'Primary admin user'
    ),
    (
        'sechevan@gmail.com',
        '\x35c846498f41a7ed1513b765c264ab222f7c3b015163fc07c78f6af00554436d2bb8f3d105a848584a0103f228132affc301505136188d50194e14f9a32d0f64',
        '\x727465da121430b0bf747ea4a4cc3c21f458c61b824b15d354fc8e10adb5d2a7e82a3aa26363d48178341995f078275e2d5b3c5df70536c6af73a6dff32e15b7',
        'Bill',
        'Gates',
        '+1-604-000-0001',
        'Secondary admin test user'
    ),
    (
        'alice.participant@plantour.test',
        NULL,
        NULL,
        'Alice',
        'Participant',
        '+1-604-000-0001',
        'First participant linked to admin'
    ),
    (
        'bob.participant@plantour.test',
        NULL,
        NULL,
        'Bob',
        'Participant',
        '+1-604-000-0002',
        'Second participant linked to admin'
    ),
    (
        'carol.tester@plantour.test',
        NULL,
        NULL,
        'Carol',
        'Tester',
        '+1-604-000-0003',
        'Extra test user'
    ),
    (
        'dave.tester@plantour.test',
        NULL,
        NULL,
        'Dave',
        'Tester',
        '+1-604-000-0004',
        'Extra test user'
    );


-- ====================================================================
-- ADMINS / PARTICIPANTS LINKS
-- ====================================================================
INSERT INTO admins_participants (id, admin_id, participant_id,participant_status_id, access_code_hash, notes)
VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM participant_statuses WHERE name = 'Active'),
        'a',
        'Same participant as admin'
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM participant_statuses WHERE name = 'Active'),
        'aa',
        'First participant linked to admin'

    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM participant_statuses WHERE name = 'Planned'),
        'b',
        'Second participant linked to admin'
    );

