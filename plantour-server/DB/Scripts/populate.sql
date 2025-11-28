---------------------------------------------------------------------
-- SET SCHEMA
---------------------------------------------------------------------
set search_path to plantour, public;


---------------------------------------------------------------------
-- CLEAN UP TEST DATA (DO NOT TOUCH REFERENCE TABLES)
---------------------------------------------------------------------

truncate table trip_user_things restart identity cascade;
truncate table trip_users restart identity cascade;
truncate table invitations restart identity cascade;

truncate table user_things restart identity cascade;
truncate table user_thing_categories restart identity cascade;

truncate table user_packages restart identity cascade;
truncate table user_package_categories restart identity cascade;

truncate table trips restart identity cascade;
truncate table users restart identity cascade;


---------------------------------------------------------------------
-- CREATE ONE ADMIN + TWO PARTICIPANTS
---------------------------------------------------------------------

-- Create admin
with admin_row as (
    insert into users (
        id, user_id, admin_id,
        first_name, last_name, email, phone, notes
    )
    values (
        gen_random_uuid(),
        'user_362ybfielSXPgOrFzIlSyiIumEP', -- admin user_id from Clerk
        null,
        'AdminJohn', 'Root',
        'admin@example.com',
        '111-111',
        'Main Administrator'
    )
    returning id
)

-- Create 2 participants assigned to this admin
insert into users (
    id, user_id, admin_id,
    first_name, last_name, email, phone, notes
)
select
    gen_random_uuid(),
    null,
    admin_row.id,
    v.first_name,
    v.last_name,
    v.email,
    v.phone,
    v.notes
from admin_row
cross join (
    values
        ('Mike',  'Johnson', 'mike@example.com', '222-222', 'Participant 1'),
        ('Sara',  'Williams','sara@example.com','333-333', 'Participant 2')
) v(first_name, last_name, email, phone, notes);


---------------------------------------------------------------------
-- CREATE THING CATEGORIES + THINGS FOR EACH TRAVELER
---------------------------------------------------------------------

with tc as (
    select id from users
),
categories as (
    insert into user_thing_categories (id, user_id, name)
    select gen_random_uuid(), id, c
    from tc cross join (values ('Clothes'), ('Electronics')) v(c)
    returning id, user_id, name
),
clothes as (
    select id as category_id from categories where name = 'Clothes'
),
electronics as (
    select id as category_id from categories where name = 'Electronics'
)

insert into user_things (
    id, category_id, short_description, description, brand, model, color
)
select gen_random_uuid(), c.category_id, 'T-Shirt', 'Basic cotton T-Shirt', 'H&M', 'Classic', 'White'
from clothes c
union all
select gen_random_uuid(), c.category_id, 'Jeans', 'Blue jeans', 'Levis', '501', 'Blue'
from clothes c
union all
select gen_random_uuid(), e.category_id, 'Smartphone', 'Android phone', 'Samsung', 'S24', 'Black'
from electronics e
union all
select gen_random_uuid(), e.category_id, 'Charger', 'USB-C charger', 'Anker', 'Nano', 'Black'
from electronics e;


---------------------------------------------------------------------
-- CREATE PACKAGE CATEGORIES + PACKAGES
---------------------------------------------------------------------

with tp as (
    select id from users
),
pc as (
    insert into user_package_categories (id, user_id, name)
    select gen_random_uuid(), id, c
    from tp cross join (values ('Backpack'), ('Suitcase')) v(c)
    returning id, user_id, name
),
backpacks as (
    select id as category_id from pc where name = 'Backpack'
),
suitcases as (
    select id as category_id from pc where name = 'Suitcase'
)

insert into user_packages (
    id, category_id, short_description, description, brand, model, color
)
select gen_random_uuid(), b.category_id, 'Daypack', 'Small daypack', 'Osprey', 'Daylite', 'Red'
from backpacks b
union all
select gen_random_uuid(), s.category_id, 'Large Suitcase', 'Standard checked-in luggage', 'Samsonite', 'Aeris', 'Black'
from suitcases s;


---------------------------------------------------------------------
-- CREATE 3 SAMPLE TRIPS (each owned by admin)
---------------------------------------------------------------------

with admin_id as ( select id from users where user_id is not null limit 1 )
insert into trips (
    id, owner_id, trip_status_id, short_description, description, start_date, end_date, require_weight
)
select
    gen_random_uuid(),
    admin_id.id,
    (select id from trip_status where name = 'Planning'),
    v.short,
    v.descr,
    v.sd,
    v.ed,
    false
from admin_id
cross join (values
    ('Alaska Fishing',   'Fishing expedition in Alaska',        '2026-06-01'::date, '2026-06-14'::date),
    ('Iceland Roadtrip', 'Ring Road and Golden Circle',         '2026-08-20'::date, '2026-09-03'::date),
    ('Japan Autumn',     'Tokyo → Kyoto → Osaka',               '2026-10-10'::date, '2026-10-25'::date)
) v(short, descr, sd, ed);


---------------------------------------------------------------------
-- CREATE TRIP_TRAVELERS (admin + all participants in all trips)
---------------------------------------------------------------------

with trip_list as (
    select id from trips
),
trav_list as (
    select id from users
)
insert into trip_users (id, trip_id, user_id, access_code)
select
    gen_random_uuid(),
    tr.id,
    tv.id,
    substring(md5(random()::text) for 8)
from trip_list tr
cross join trav_list tv;


---------------------------------------------------------------------
-- ASSIGN ALL TRAVELER THINGS TO EACH TRIP_TRAVELER OF SAME PERSON
---------------------------------------------------------------------

with tt as (
    select tt.id as trip_user_id, tt.user_id
    from trip_users tt
),
things as (
    select th.id as user_thing_id, c.user_id
    from user_things th
    join user_thing_categories c on c.id = th.category_id
)
insert into trip_user_things (
    id, trip_user_id, user_thing_id, user_package_id, packing_status_id
)
select
    gen_random_uuid(),
    tt.trip_user_id,
    th.user_thing_id,
    null,
    (select id from packing_status where name = 'Planning')
from tt
join things th on th.user_id = tt.user_id;


---------------------------------------------------------------------
-- DONE
---------------------------------------------------------------------

select 'Seed data created successfully' as status;
