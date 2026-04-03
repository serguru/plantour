drop schema if exists plantour cascade;

create schema plantour;

set search_path to plantour, public;

-----------------------------------------------------------------------
-- ITINERARY_PART_CATEGORIES
-----------------------------------------------------------------------
create table plantour.itinerary_part_categories (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique
);
insert into plantour.itinerary_part_categories (name)
values 
    ('Flight'),
    ('Ferry'),
    ('Train'),
    ('Drive'),
    ('Bus'),
    ('Sail'),
    ('Transit'),
    ('Transfer'),
    ('Hotel'),
    ('Airbnb'),
    ('Camping'),
    ('Resort'),
    ('Mooring'),
    ('Hostel'),
    ('Breakfast'),
    ('Brunch'),
    ('Lunch'),
    ('Dinner'),
    ('Drinks'),
    ('Tasting'),
    ('Sightseeing'),
    ('Tour'),
    ('Hike'),
    ('Fishing'),
    ('Museum'),
    ('Shopping'),
    ('Beach'),
    ('Meeting'),
    ('Check-in'),
    ('Check-out'),
    ('Layover'),
    ('Free Time'),
    ('Reminder'),
    ('Excursion'),
    ('Pickup');


create table plantour.currencies (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique
);
insert into plantour.currencies (name) values
('AED'),('AFN'),('ALL'),('AMD'),('ANG'),('AOA'),('ARS'),('AUD'),('AWG'),('AZN'),('BAM'),('BBD'),('BDT'),('BGN'),('BHD'),('BIF'),('BMD'),('BND'),('BOB'),('BRL'),('BSD'),('BTN'),('BWP'),('BYN'),('BZD'),('CAD'),('CDF'),('CHF'),('CLP'),('CNY'),('COP'),('CRC'),('CUP'),('CVE'),('CZK'),('DJF'),('DKK'),('DOP'),('DZD'),('EGP'),('ERN'),('ETB'),('EUR'),('FJD'),('FKP'),('GBP'),('GEL'),('GHS'),('GIP'),('GMD'),('GNF'),('GTQ'),('GYD'),('HKD'),('HNL'),('HRK'),('HTG'),('HUF'),('IDR'),('ILS'),('INR'),('IQD'),('IRR'),('ISK'),('JMD'),('JOD'),('JPY'),('KES'),('KGS'),('KHR'),('KMF'),('KPW'),('KRW'),('KWD'),('KYD'),('KZT'),('LAK'),('LBP'),('LKR'),('LRD'),('LSL'),('LYD'),('MAD'),('MDL'),('MGA'),('MKD'),('MMK'),('MNT'),('MOP'),('MRU'),('MUR'),('MVR'),('MWK'),('MXN'),('MYR'),('MZN'),('NAD'),('NGN'),('NIO'),('NOK'),('NPR'),('NZD'),('OMR'),('PAB'),('PEN'),('PGK'),('PHP'),('PKR'),('PLN'),('PYG'),('QAR'),('RON'),('RSD'),('RUB'),('RWF'),('SAR'),('SBD'),('SCR'),('SDG'),('SEK'),('SGD'),('SHP'),('SLL'),('SOS'),('SRD'),('SSP'),('STN'),('SVC'),('SYP'),('SZL'),('THB'),('TJS'),('TMT'),('TND'),('TOP'),('TRY'),('TTD'),('TWD'),('TZS'),('UAH'),('UGX'),('USD'),('UYU'),('UZS'),('VES'),('VND'),('VUV'),('WST'),('XAF'),('XCD'),('XOF'),('XPF'),('YER'),('ZAR'),('ZMW'),('ZWL');

create table plantour.payment_methods (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique
);
insert into plantour.payment_methods (name) values
('cash'),('credit card'),('debit card'),('prepaid card'),('bank transfer'),('direct debit'),('digital wallet'),('mobile pay'),('cryptocurrency'),('buy now pay later'),('wire transfer'),('certified cheque');

-----------------------------------------------------------------------
-- COMMUNICATION TYPES
-----------------------------------------------------------------------
create table communication_types (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
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
    name text not null unique
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
    name text not null unique,
    notes text
);
insert into trip_status (name) values
('Planning'),
('Preparation'),
('Active'),
('Completed');


create table thing_categories (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
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

create table todo_categories (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    notes text
);
insert into todo_categories (name) values
('Accommodation'),
('Booking'),
('Communication'),
('Documents'),
('Finance'),
('Health & Safety'),
('Preparation'),
('Shopping'),
('Transportation');

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
    category text,
    name text not null unique,
    units text,
    value decimal(10,3) check(value > 0),
    notes text
);

create or replace view v_template_things_full as
select 
    tt.id as thing_id,
    tt.name as thing_name,
    tt.category,
    tt.units,
    tt.value,
    tt.notes as thing_notes,

    tpl.id as template_id,
    tpl.name as template_name,

    act.name as activity_name,

    tr.name as temperature_range_name,
    tr.fromtemp,
    tr.totemp,

    ar.name as age_range_name,
    ar.fromage,
    ar.toage

from template_things tt
join thing_templates tpl on tt.template_id = tpl.id
join activities act on tpl.activity_id = act.id
left join temperature_ranges tr on tpl.temperature_ranges_id = tr.id
left join age_ranges ar on tpl.age_ranges_id = ar.id;


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
create table plantour.plans (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    paddle_product_id text null unique,
    notes text,
    active boolean default true,
    public boolean,
    allowed_items int,
    allowed_travelers int,

    allowed_AI_prompts int, -- per day
    extended_AI_allowed boolean not null default false,

    allowed_todos int,
    allowed_expenses int,
    allowed_itinerary_parts int,
    allowed_activities int,

    created_at timestamptz not null default (now() at time zone 'utc')
);

insert into plantour.plans (name, paddle_product_id, notes, public, 
allowed_items,  allowed_travelers,  allowed_AI_prompts,         extended_AI_allowed,
allowed_todos,  allowed_expenses,   allowed_itinerary_parts,    allowed_activities) values

('Starter', null, 'Suitable for short and easy trips alone or in pairs', true, 
10,             2,                  5,                          false, 
3,              3,                  3,                          6
),

('Family', 'pro_01khvs7gpz701mh82v0p500mcn', 'Perfect for regular travelers, families and small groups', true, 
250,           5,                  20,                        false,
100,           500,                20,                        100
),

('Expedition', 'pro_01khvsa34wt2mg7nqac3c45jyc', 'Ideal for advanced travelers, large groups and expeditions', true, 
2500,           50,                 100,                      true,
1000,           5000,               50,                       1000
);

create table plantour.prices (
    id uuid primary key default gen_random_uuid(),
    plan_id uuid not null references plans(id),
    paddle_price_id text null unique,
    name text not null unique,
    value_cents int not null check(value_cents >= 0)
);

insert into plantour.prices (paddle_price_id,plan_id,name,value_cents) values
(
    null,
    (select id from plantour.plans where name = 'Starter'),
    'Starter Free',
    0
),
(
    'pri_01khvsx5szpnfqd97c6sdv3e2w',
    (select id from plantour.plans where name = 'Family'),
    'Family Monthly',
    1299
),
(
    'pri_01khvsg62zpjhh6qbmc5sfmkm3',
    (select id from plantour.plans where name = 'Expedition'),
    'Expedition Monthly',
    4499
),
(
    'pri_01khvsyg17b43cm5kf0t63zfnr',
    (select id from plantour.plans where name = 'Family'),
    'Family Yearly',
    11999
),
(
    'pri_01khvspsgmrkcggdxxtksbzy88',
    (select id from plantour.plans where name = 'Expedition'),
    'Expedition Yearly',
    39999
);


-----------------------------------------------------------------------
-- USERS
-----------------------------------------------------------------------
create table users (
    id uuid not null primary key default gen_random_uuid(),
    email text not null unique check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    first_name text,
    last_name text,
    phone text,
    google_sub text unique,
    facebook_user_id text unique,
    notes text,
    created_at timestamptz not null default (now() at time zone 'utc'),
    access_type_id uuid not null references access_types(id),
    paddle_subscription_id text unique,
    temporary bool not null default false,
    participant_code text null,
    currency_id uuid null references currencies(id) on delete set null
);

create or replace function plantour.prevent_email_change_for_non_temporary_users()
returns trigger
language plpgsql
as $$
begin
    if old.temporary = false and new.email is distinct from old.email then
        raise exception 'Email cannot be changed for non-temporary users';
    end if;

    return new;
end;
$$;

--drop trigger if exists trg_prevent_email_change_for_non_temporary_users on plantour.users;
create trigger trg_prevent_email_change_for_non_temporary_users
before update on plantour.users
for each row
execute function plantour.prevent_email_change_for_non_temporary_users();

create table plantour.user_settings (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references plantour.users(id) on delete cascade,
    active boolean default false,
    key text not null,
    value text not null,
    value_type text not null check (value_type in ('json', 'string', 'integer', 'boolean')) default 'string',
    notes text
);
create unique index idx_user_settings_user_id_key on plantour.user_settings(user_id, key);

create table ai_prompt_checks (
    id uuid primary key not null references users(id) on delete cascade,
    start timestamptz not null ,
    count int not null check(count >= 0)
);

create table plantour.user_keys (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    name text not null,
    key text not null,
    active boolean not null default true,
    created_at timestamptz not null default (now() at time zone 'utc'),
    notes text
);
create unique index idx_user_keys_user_id_name on plantour.user_keys(user_id, name);


create table admins_participants (
    id uuid not null primary key default gen_random_uuid(),
    admin_id uuid not null references users(id) on delete cascade,
    participant_id uuid not null references users(id) on delete cascade,
    access_code_hash char(64) not null unique,
    notes text
);
create unique index idx_admins_participants_admin_id_participant_id on admins_participants(admin_id, participant_id);

-- create or replace function plantour.prevent_self_link_admins_participants_delete()
-- returns trigger
-- language plpgsql
-- as $$
-- begin
--     if old.admin_id = old.participant_id then
--         raise exception 'Admin as Participant cannot be deleted';
--     end if;

--     return old;
-- end;
-- $$;

-- create trigger trg_prevent_self_link_admins_participants_delete
-- before delete on plantour.admins_participants
-- for each row
-- execute function plantour.prevent_self_link_admins_participants_delete();

-- create or replace function plantour.prevent_delete_admin_participant_assignments()
-- returns trigger
-- language plpgsql
-- as $$
-- begin
--     if exists (
--         select 1
--         from plantour.trip_users trip_user
--         where trip_user.admin_participant_id = old.id
--           and (
--               exists (
--                   select 1
--                   from plantour.trip_shared_things shared_thing
--                   where shared_thing.assigned_to_id = trip_user.id
--               )
--               or exists (
--                   select 1
--                   from plantour.trip_shared_todos shared_todo
--                   where shared_todo.assigned_to_id = trip_user.id
--               )
--           )
--     ) then
--         raise exception 'admins_participants row cannot be deleted while the participant has assigned shared things or shared todos';
--     end if;

--     return old;
-- end;
-- $$;

-- create trigger trg_prevent_delete_admin_participant_assignments
-- before delete on plantour.admins_participants
-- for each row
-- execute function plantour.prevent_delete_admin_participant_assignments();

-----------------------------------------------------------------------
-- USER THINGS
-----------------------------------------------------------------------
create table user_things (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    category text,
    name text not null,
    units text,
    value decimal(10,3) check(value > 0),
    shared boolean not null default false,
    notes text
);
create unique index idx_user_things_user_id_name on user_things(user_id, name);

-----------------------------------------------------------------------
-- USER TODOS
-----------------------------------------------------------------------
create table user_todos (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    category text,
    name text not null,
    notes text
);
create unique index idx_user_todos_user_id_name on user_todos(user_id, name);

-----------------------------------------------------------------------
-- USER PACKAGES
-----------------------------------------------------------------------
create table user_packages (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    name text not null,
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
    name text not null,
    notes text,
    start_date date not null,
    end_date date not null,
    created_at timestamptz not null default (now() at time zone 'utc'),
    currency_id uuid not null references currencies(id) on delete set null,
    constraint ch_trips_start_before_end check (
        start_date is null 
        or end_date is null 
        or start_date <= end_date
    )
);
create unique index idx_trips_user_id_name on trips(user_id, name);

create or replace function plantour.prevent_overlapping_trips_for_user()
returns trigger
language plpgsql
as $$
begin
    if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
        perform 1
        from plantour.users
        where id in (old.user_id, new.user_id)
        order by id
        for update;
    else
        perform 1
        from plantour.users
        where id = new.user_id
        for update;
    end if;

    if exists (
        select 1
        from plantour.trips existing_trip
        where existing_trip.user_id = new.user_id
          and existing_trip.id is distinct from new.id
          and new.start_date < existing_trip.end_date
          and new.end_date > existing_trip.start_date
    ) then
        raise exception 'Trip dates overlap with another trip for this user';
    end if;

    return new;
end;
$$;

create trigger trg_prevent_overlapping_trips_for_user
before insert or update of user_id, start_date, end_date on plantour.trips
for each row
execute function plantour.prevent_overlapping_trips_for_user();

create or replace function plantour.prevent_trip_currency_change_with_expenses()
returns trigger
language plpgsql
as $$
begin
    if new.currency_id is distinct from old.currency_id
       and (
           exists (
               select 1
               from plantour.trip_users trip_user
               join plantour.trip_user_expenses expense on expense.trip_user_id = trip_user.id
               where trip_user.trip_id = old.id
           )
           or exists (
               select 1
               from plantour.trip_shared_expenses shared_expense
               where shared_expense.trip_id = old.id
           )
       ) then
        raise exception 'Trip currency cannot be changed while the trip has expenses';
    end if;

    return new;
end;
$$;

create trigger trg_prevent_trip_currency_change_with_expenses
before update of currency_id on plantour.trips
for each row
execute function plantour.prevent_trip_currency_change_with_expenses();


-----------------------------------------------------------------------
-- TRIP ITINERARY_PARTS
-----------------------------------------------------------------------
create table itinerary_parts (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    name text not null,
    category text,
    address text,
    latitude decimal(9,6) check (latitude is null or latitude between -90 and 90),
    longitude decimal(9,6) check (longitude is null or longitude between -180 and 180),
    notes text,
    start_date timestamptz not null,
    end_date timestamptz null,
    created_at timestamptz not null default (now() at time zone 'utc'),
    constraint ch_itinerary_parts_start_before_end check (
        end_date is null 
        or start_date <= end_date
    ),
    constraint ch_itinerary_parts_lat_long check (
        (latitude is null and longitude is null) or 
        (latitude is not null and longitude is not null) 
    )
);
create unique index idx_itinerary_parts_trip_id_name on itinerary_parts(trip_id, name, start_date);


-----------------------------------------------------------------------
-- INVITATIONS
-----------------------------------------------------------------------
create table invitations (
    id uuid not null primary key default gen_random_uuid(),
    admin_participant_id uuid not null references admins_participants(id) on delete cascade,
    access_code text,
    first_name text,
    last_name text,
    email text,
    phone text,

    subject text not null,
    message text not null,

    created_at timestamptz not null default (now() at time zone 'utc'),
    expires_at timestamptz,
    accepted_at timestamptz,
    refused_at timestamptz,
    sent_at timestamptz,
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
    packaging_complete boolean not null default false,  
    notes text,
    nopack_weight_value decimal(10,3) check(nopack_weight_value > 0),
    nopack_weight_unit text,

    shared_amount decimal(19,2) not null default 0 check (shared_amount >= 0),
    assigned_at timestamptz null,
    assigned_deadline timestamptz null,
    rejected boolean not null default false
);
create unique index idx_trip_users_trip_id_user_id on trip_users(trip_id, admin_participant_id);

create or replace function plantour.prevent_delete_trip_user_with_assigned_shared_entities()
returns trigger
language plpgsql
as $$
begin
    if exists (
        select 1
        from plantour.trip_shared_things shared_thing
        where shared_thing.assigned_to_id = old.id
    ) then
        raise exception 'trip user cannot be deleted while assigned shared things exist';
    end if;

    if exists (
        select 1
        from plantour.trip_shared_todos shared_todo
        where shared_todo.assigned_to_id = old.id
    ) then
        raise exception 'trip user cannot be deleted while assigned shared todos exist';
    end if;

    return old;
end;
$$;

create trigger trg_prevent_delete_trip_user_with_assigned_shared_entities
before delete on plantour.trip_users
for each row
execute function plantour.prevent_delete_trip_user_with_assigned_shared_entities();


-----------------------------------------------------------------------
-- TRIP ACTIVITIES
-----------------------------------------------------------------------
create table plantour.trip_activities (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    -- If null - group activity
    trip_user_id uuid null references trip_users(id) on delete cascade,
    itinerary_part_id uuid null references itinerary_parts(id) on delete cascade,
    activity text,
    name text not null,
    notes text,
    start_date timestamptz,
    end_date timestamptz,
    address text,
    latitude decimal(9,6) check (latitude is null or latitude between -90 and 90),
    longitude decimal(9,6) check (longitude is null or longitude between -180 and 180),

    constraint ch_trip_activities_start_before_end check (
        start_date is null or end_date is null or
        start_date <= end_date
    ),
    constraint ch_trip_activities_lat_long check (
        (latitude is null and longitude is null) or 
        (latitude is not null and longitude is not null) 
    )
);

----------------------------------------------------------------------
-- TRIP NOTES
-----------------------------------------------------------------------
create table plantour.trip_notes (
    id uuid primary key default gen_random_uuid(),
    trip_user_id uuid references trip_users(id),
    trip_activity_id uuid null references trip_activities(id) on delete cascade,
    title text not null,
    content_json jsonb,
    note_order integer null check (note_order > 0),
    created_at timestamptz default (now() at time zone 'utc')
);

-----------------------------------------------------------------------
-- TRIP USER EXPENSES
-----------------------------------------------------------------------
create table trip_user_expenses (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    name text not null,
    payment_method text,
    currency_id uuid null references currencies(id),
    rate decimal(19,8) null,
    amount decimal(19,2) not null check (amount > 0),
    recipient_id uuid null references trip_users(id) on delete cascade,
    notes text,
    shared boolean not null default false,
    finished_at timestamptz,
    finished text null check (finished in ('success', 'failure') or finished is null)

    constraint ch_trip_user_expenses_users check 
    (
        recipient_id is null or recipient_id != trip_user_id
    ),
    constraint ch_trip_user_expenses_rate check 
    (
        (currency_id is null and rate is null) or
        (currency_id is not null and rate is not null)
    )
);

-----------------------------------------------------------------------
-- TRIP USER PACKAGES
-----------------------------------------------------------------------
create table trip_user_packages (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    name text not null,
    label text,
    notes text,
    packing_list_included boolean not null default false,
    weight_value decimal(10,3) check(weight_value > 0),
    weight_unit text
);
create unique index idx_trip_user_packages_trip_user_id_name on trip_user_packages(trip_user_id, name);

-----------------------------------------------------------------------
-- TRIP USER THINGS
-----------------------------------------------------------------------
create table trip_user_things (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    category text,      
    name text not null,
    units text,
    value decimal(10,3) check(value > 0),
    notes text,
    trip_user_package_id uuid references trip_user_packages(id) on delete set null,
    finished_at timestamptz,
    finished text null check (finished in ('success', 'failure') or finished is null)
);
create unique index idx_trip_user_things_trip_user_id_name on trip_user_things(trip_user_id, name);

-----------------------------------------------------------------------
-- TRIP USER TODOS
-----------------------------------------------------------------------
create table trip_user_todos (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    category text,
    name text not null,
    notes text,
    finished_at timestamptz,
    finished text null check (finished in ('success', 'failure') or finished is null)
);
create unique index idx_trip_user_todos_trip_user_id_name on trip_user_todos(trip_user_id, name);


-----------------------------------------------------------------------
-- TRIP USER IMPROVEMENTS
-----------------------------------------------------------------------
create table plantour.trip_user_improvements (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references plantour.trip_users(id) on delete cascade,
    name text not null,
    notes text,
    improvement_order integer not null check (improvement_order > 0),
    finished text null check (finished in ('success', 'failure') or finished is null)
);
create unique index idx_trip_user_improvements_improvement_order on plantour.trip_user_improvements(trip_user_id, improvement_order);

create or replace function plantour.limit_trip_user_improvements_per_trip()
returns trigger
language plpgsql
as $$
declare
    new_trip_id uuid;
    old_trip_id uuid;
    existing_count integer;
begin
    select trip_user.trip_id
    into new_trip_id
    from plantour.trip_users trip_user
    where trip_user.id = new.trip_user_id;

    if tg_op = 'UPDATE' and old.trip_user_id is distinct from new.trip_user_id then
        select trip_user.trip_id
        into old_trip_id
        from plantour.trip_users trip_user
        where trip_user.id = old.trip_user_id;

        perform 1
        from plantour.trips
        where id in (new_trip_id, old_trip_id)
        order by id
        for update;
    else
        perform 1
        from plantour.trips
        where id = new_trip_id
        for update;
    end if;

    select count(*)
    into existing_count
    from plantour.trip_user_improvements improvement
    join plantour.trip_users trip_user on trip_user.id = improvement.trip_user_id
    where trip_user.trip_id = new_trip_id
      and improvement.id is distinct from new.id;

    if existing_count >= 100 then
        raise exception 'trip cannot have more than 100 improvements';
    end if;

    return new;
end;
$$;

create trigger trg_limit_trip_user_improvements_per_trip
before insert or update of trip_user_id on plantour.trip_user_improvements
for each row
execute function plantour.limit_trip_user_improvements_per_trip();

create table plantour.trip_user_improvements_log (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_improvement_id uuid not null references plantour.trip_user_improvements(id) on delete cascade,
    created_at timestamptz default (now() at time zone 'utc')
);
create index idx_trip_user_improvements_log_created_at on trip_user_improvements_log(created_at);



-----------------------------------------------------------------------
-- TRIP SHARED THINGS
-----------------------------------------------------------------------
create table trip_shared_things (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    category text,      
    name text not null,
    units text,
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
-- TRIP SHARED TODOS
-----------------------------------------------------------------------
create table trip_shared_todos (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    category text,
    name text not null,
    notes text,

    assigned_to_id uuid null references trip_users(id) on delete set null,
    assigned_todo_id uuid null references trip_user_todos(id) on delete set null,
    assigned_at timestamptz null,
    assigned_deadline timestamptz null,
    rejected boolean not null default false


);
create unique index idx_trip_shared_todos_trip_id_name on trip_shared_todos(trip_id, name);

create or replace function plantour.prevent_delete_accepted_trip_shared_thing()
returns trigger
language plpgsql
as $$
begin
    if old.assigned_thing_id is not null then
        raise exception 'accepted shared thing cannot be deleted while assigned; unassign it first';
    end if;

    return old;
end;
$$;

create trigger trg_prevent_delete_accepted_trip_shared_thing
before delete on plantour.trip_shared_things
for each row
execute function plantour.prevent_delete_accepted_trip_shared_thing();

create or replace function plantour.prevent_delete_referenced_trip_user_thing()
returns trigger
language plpgsql
as $$
begin
    if exists (
        select 1
        from plantour.trip_shared_things shared_thing
        where shared_thing.assigned_thing_id = old.id
    ) then
        raise exception 'trip user thing cannot be deleted while referenced by a shared thing; unassign it first';
    end if;

    return old;
end;
$$;

create trigger trg_prevent_delete_referenced_trip_user_thing
before delete on plantour.trip_user_things
for each row
execute function plantour.prevent_delete_referenced_trip_user_thing();

create or replace function plantour.prevent_delete_accepted_trip_shared_todo()
returns trigger
language plpgsql
as $$
begin
    if old.assigned_todo_id is not null then
        raise exception 'accepted shared todo cannot be deleted while assigned; unassign it first';
    end if;

    return old;
end;
$$;

create trigger trg_prevent_delete_accepted_trip_shared_todo
before delete on plantour.trip_shared_todos
for each row
execute function plantour.prevent_delete_accepted_trip_shared_todo();

create or replace function plantour.prevent_delete_referenced_trip_user_todo()
returns trigger
language plpgsql
as $$
begin
    if exists (
        select 1
        from plantour.trip_shared_todos shared_todo
        where shared_todo.assigned_todo_id = old.id
    ) then
        raise exception 'trip user todo cannot be deleted while referenced by a shared todo; unassign it first';
    end if;

    return old;
end;
$$;

create trigger trg_prevent_delete_referenced_trip_user_todo
before delete on plantour.trip_user_todos
for each row
execute function plantour.prevent_delete_referenced_trip_user_todo();

-----------------------------------------------------------------------
-- TRIP SHARED EXPENSES
-----------------------------------------------------------------------
create table trip_shared_expenses (
    id uuid not null primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    category text,
    name text not null,
    amount decimal(19,2) not null check (amount > 0),
    notes text
);



----------------------------------------------------------------------
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


create table contact_submissions (
    -- identification
    id uuid primary key default gen_random_uuid(),
    
    -- core data
    full_name text not null,
    email text not null check (email ~* '^[a-za-z0-9._%+-]+@[a-za-z0-9.-]+\.[a-za-z]{2,}$'),
    phone_number text,
    subject_category text,
    message_body text not null,
    
    -- workflow & state
    contact_status text null check (contact_status in ('new', 'in_progress', 'resolved', 'spam') or contact_status is null),

    assigned_agent_id uuid, 
    internal_notes text,
    
    -- metadata & security
    ip_address inet,
    user_agent text,
    referrer_url text,
    
    -- timestamps
    created_at timestamptz not null default (now() at time zone 'utc')
);

-- indexes for performance
create index idx_contact_email on contact_submissions(email);
create index idx_contact_status on contact_submissions(contact_status);


create table ai_prompts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    prompt text not null,
    created_at timestamptz not null default (now() at time zone 'utc')
);
create index idx_ai_prompts_prompt on ai_prompts(prompt);

create table ai_things (
    id uuid primary key default gen_random_uuid(),
    prompt_id uuid not null references ai_prompts(id) on delete cascade,
    category text,
    name text not null,
    units text,
    value decimal(10,3) check(value > 0),
    notes text

);
create unique index idx_ai_prompts_prompt_id_name on ai_things(prompt_id, name);

create table plantour.ai_trip_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    question text not null,
    plan json not null,
    created_at timestamptz not null default (now() at time zone 'utc')
);
create unique index idx_ai_trip_plans_question on plantour.ai_trip_plans(user_id, question);

-- serilog postgresql logging tables
-- this script creates the necessary tables for storing serilog logs in postgresql

-- main logs table
create table plantour.logs (
    id serial primary key,
    message_template text,
    level text,
    time_stamp timestamptz not null default (now() at time zone 'utc'),
    exception text,
    log_event text,
    properties jsonb,
    event_type text,
    subtype text
);

-- create indexes for better query performance
create index if not exists idx_logs_timestamp 
    on plantour.logs(time_stamp desc);

create index if not exists idx_logs_level 
    on plantour.logs(level);

create index if not exists idx_logs_message_template 
    on plantour.logs(message_template);

-- add comments to tables for documentation
comment on table plantour.logs 
    is 'stores application log events from serilog framework';

comment on column plantour.logs.id 
    is 'auto-incrementing primary key';

comment on column plantour.logs.message_template 
    is 'the log message template with placeholders';

comment on column plantour.logs.level 
    is 'log level: verbose, debug, information, warning, error, fatal';

comment on column plantour.logs.time_stamp 
    is 'timestamptz when the log event was recorded';

comment on column plantour.logs.exception 
    is 'exception details if applicable';

comment on column plantour.logs.log_event 
    is 'complete log event as json';

comment on column plantour.logs.properties 
    is 'additional structured properties as json (enrichers, context data)';

-- create a view for easier log querying
create or replace view plantour.recent_logs as
select 
    id,
    time_stamp,
    level,
    message_template,
    exception,
    properties
from plantour.logs
order by time_stamp desc
limit 1000;

comment on view plantour.recent_logs 
    is 'view of the 1000 most recent log entries';

-- create a view for error logs
create or replace view plantour.error_logs as
select 
    id,
    time_stamp,
    level,
    message_template,
    exception,
    properties
from plantour.logs
where level in ('Error', 'Fatal')
order by time_stamp desc
limit 500;

comment on view plantour.error_logs 
    is 'view of the 500 most recent error/fatal logs';

create table if not exists plantour.api_visits (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default (now() at time zone 'utc'),
    method text,
    path text,
    query_string text,
    endpoint text,
    status_code int,
    duration_ms int,
    ip_address inet,
    forwarded_for text,
    user_agent text,
    referrer text,
    host text,
    scheme text,
    protocol text,
    request_id text,
    request_size_bytes bigint,
    user_id uuid,
    user_email text,
    user_role text
);

create index if not exists idx_api_visits_created_at on plantour.api_visits (created_at desc);
create index if not exists idx_api_visits_user_id on plantour.api_visits (user_id);
create index if not exists idx_api_visits_status_code on plantour.api_visits (status_code);
create index if not exists idx_api_visits_path on plantour.api_visits (path);
create index if not exists idx_api_visits_endpoint on plantour.api_visits (endpoint);


create table plantour.settings (
    key text not null primary key,
    value text not null,
    value_type text not null check (value_type in ('string', 'integer', 'boolean')) default 'string',
    notes text,
    updated_at timestamptz not null default (now() at time zone 'utc')
);
    
create table plantour.refresh_tokens (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    token uuid not null unique,
    expires_at timestamptz not null,
    created_at timestamptz not null default current_timestamp
    
    -- a token is valid if it hasn't expired and hasn't been revoked
    constraint chk_expiration check (expires_at > created_at)
);


-- TickerQ operational store objects for plantour (DB-first)
-- Generated from TickerQOperationalDbContext and adapted to be re-runnable.

-- DO $EF$
-- BEGIN
--     IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'plantour') THEN
--         CREATE SCHEMA plantour;
--     END IF;
-- END $EF$;


CREATE TABLE IF NOT EXISTS plantour."CronTickers" (
    "Id" uuid NOT NULL,
    "Expression" text,
    "Request" bytea,
    "Retries" integer NOT NULL,
    "RetryIntervals" integer[],
    "Function" text,
    "Description" text,
    "InitIdentifier" text,
    "CreatedAt" timestamp without time zone NOT NULL,
    "UpdatedAt" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_CronTickers" PRIMARY KEY ("Id")
);


CREATE TABLE IF NOT EXISTS plantour."TimeTickers" (
    "Id" uuid NOT NULL,
    "Function" text,
    "Description" text,
    "InitIdentifier" text,
    "CreatedAt" timestamp without time zone NOT NULL,
    "UpdatedAt" timestamp without time zone NOT NULL,
    "Status" integer NOT NULL,
    "LockHolder" text,
    "Request" bytea,
    "ExecutionTime" timestamp without time zone,
    "LockedAt" timestamp without time zone,
    "ExecutedAt" timestamp without time zone,
    "ExceptionMessage" text,
    "SkippedReason" text,
    "ElapsedTime" bigint NOT NULL,
    "Retries" integer NOT NULL,
    "RetryCount" integer NOT NULL,
    "RetryIntervals" integer[],
    "ParentId" uuid,
    "RunCondition" integer,
    CONSTRAINT "PK_TimeTickers" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_TimeTickers_TimeTickers_ParentId" FOREIGN KEY ("ParentId") REFERENCES plantour."TimeTickers" ("Id")
);


CREATE TABLE IF NOT EXISTS plantour."CronTickerOccurrences" (
    "Id" uuid NOT NULL,
    "Status" integer NOT NULL,
    "LockHolder" text,
    "ExecutionTime" timestamp without time zone NOT NULL,
    "CronTickerId" uuid NOT NULL,
    "LockedAt" timestamp without time zone,
    "ExecutedAt" timestamp without time zone,
    "ExceptionMessage" text,
    "SkippedReason" text,
    "ElapsedTime" bigint NOT NULL,
    "RetryCount" integer NOT NULL,
    "CreatedAt" timestamp without time zone NOT NULL,
    "UpdatedAt" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_CronTickerOccurrences" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CronTickerOccurrences_CronTickers_CronTickerId" FOREIGN KEY ("CronTickerId") REFERENCES plantour."CronTickers" ("Id") ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS "IX_CronTickerOccurrence_CronTickerId" ON plantour."CronTickerOccurrences" ("CronTickerId");


CREATE INDEX IF NOT EXISTS "IX_CronTickerOccurrence_ExecutionTime" ON plantour."CronTickerOccurrences" ("ExecutionTime");


CREATE INDEX IF NOT EXISTS "IX_CronTickerOccurrence_Status_ExecutionTime" ON plantour."CronTickerOccurrences" ("Status", "ExecutionTime");


CREATE UNIQUE INDEX IF NOT EXISTS "UQ_CronTickerId_ExecutionTime" ON plantour."CronTickerOccurrences" ("CronTickerId", "ExecutionTime");


CREATE INDEX IF NOT EXISTS "IX_CronTickers_Expression" ON plantour."CronTickers" ("Expression");


CREATE INDEX IF NOT EXISTS "IX_Function_Expression" ON plantour."CronTickers" ("Function", "Expression");


CREATE INDEX IF NOT EXISTS "IX_TimeTicker_ExecutionTime" ON plantour."TimeTickers" ("ExecutionTime");


CREATE INDEX IF NOT EXISTS "IX_TimeTicker_Status_ExecutionTime" ON plantour."TimeTickers" ("Status", "ExecutionTime");


CREATE INDEX IF NOT EXISTS "IX_TimeTickers_ParentId" ON plantour."TimeTickers" ("ParentId");


