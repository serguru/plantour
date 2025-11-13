drop schema if exists pack cascade;
drop schema if exists shared cascade;

create schema shared;

set search_path to shared, public;

create table currencies (
    id bigint primary key,
    name varchar(50) not null unique,
    character text,
    notes text
);

insert into currencies (id, name, character) values
(1,'USD','$'),
(2,'CAD','$'),
(3,'EUR','€'),
(4,'GBP','£'),
(5,'JPY','¥'),
(6,'CNY','¥');  

create table unit_categories (
    id bigint primary key,
    name varchar(50) not null unique,
    notes text
);

insert into unit_categories (id, name) values
(1, 'weight'),
(2, 'volume'),
(3, 'length');

-- Units of measurement table
create table units (
    id bigint primary key,
    unit_category_id bigint not null references unit_categories(id),
    name varchar(50) not null unique,
    abbreviation varchar(10) not null unique
);


-- Insert common units
insert into units (id, unit_category_id, name, abbreviation) values
(1, 1, 'Kilogram', 'kg'),
(2, 1, 'Gram', 'g'),
(3, 1, 'Pound', 'lb'),
(4, 1, 'Ounce', 'oz'),
(5, 2, 'Liter', 'L'),
(6, 2, 'Milliliter', 'ml'),
(7, 3, 'Meter', 'm'),
(8, 3, 'Centimeter', 'cm'),
(9, 3, 'Inch', 'in');


create schema pack;

-- Set search path to the pack schema
set search_path to pack, public;

create table trip_status (
    id bigint primary key,
    name varchar(100) not null unique,
    notes text
);

insert into trip_status (id, name) values
(1, 'Planning'),
(2, 'Active'),
(3, 'Completed'),
(4, 'Archived');

create table packing_status (
    id bigint primary key,
    name varchar(100) not null unique,
    notes text
);

insert into packing_status (id, name) values
(1, 'Planning'),
(2, 'Active'),
(3, 'Completed'),
(4, 'Verified');

-- Pack users table
create table pack_users (
    id bigserial primary key,
    plantour_user_id uuid not null unique references auth.users(id) on delete cascade
);

-- Travelers table
create table travelers (
    id bigserial primary key,
    pack_user_id bigint not null references pack_users(id) on delete cascade,
    name varchar(100) not null,
    email varchar(255) not null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone varchar(20),
    notes text
);
create unique index idx_travelers_email_pack_user_id on travelers(email, pack_user_id);

-- Categories for traveler's things
create table thing_categories (
    id bigserial primary key,
    pack_user_id bigint not null references pack_users(id) on delete cascade,
    name varchar(100) not null,
    description text
);
create unique index idx_thing_categories_name_pack_user_id on thing_categories(name, pack_user_id);

-- Traveler's things
create table traveler_things (
    id bigserial primary key,
    traveler_id bigint not null references travelers(id) on delete cascade,
    thing_category_id bigint not null references thing_categories(id),
    short_description varchar(200) not null,
    description text,
    brand varchar(100),
    model varchar(100),
    color varchar(50),
    
    -- Weight and dimensions
    weight_value decimal(10,3),
    weight_unit_id bigint references shared.units(id),
    length_value decimal(10,2),
    width_value decimal(10,2),
    height_value decimal(10,2),
    dimension_unit_id bigint references shared.units(id),
    
    -- Purchase info
    purchase_date date,
    purchase_price decimal(10,2),
    purchase_currency_id bigint null references shared.currencies(id)
);

create index idx_traveler_traveler_id on traveler_things(traveler_id);
create index idx_traveler_things_category_id on traveler_things(thing_category_id);

-- Categories for traveler's packages
create table package_categories (
    id bigserial primary key,
    pack_user_id bigint not null references pack_users(id) on delete cascade,
    name varchar(100) not null,
    description text
);
create unique index idx_package_categories_name_pack_user_id on package_categories(name, pack_user_id);

-- Traveler's packaging
create table traveler_packages (
    id bigserial primary key,
    traveler_id bigint not null references travelers(id) on delete cascade,
    package_category_id bigint not null  references package_categories(id),
    short_description varchar(200) not null,
    description text,
    brand varchar(100),
    model varchar(100),
    color varchar(50),
    
    empty_weight_value decimal(10,3),
    weight_unit_id bigint references shared.units(id),
    capacity_value decimal(10,2),
    capacity_unit_id bigint references shared.units(id),
    length_value decimal(10,2),
    width_value decimal(10,2),
    height_value decimal(10,2),
    dimension_unit_id bigint references shared.units(id),
    
    -- Nested package support
    parent_package_id bigint references traveler_packages(id)
);

create index idx_traveler_packages_traveler_id on traveler_packages(traveler_id);
create index idx_traveler_packages_parent_id on traveler_packages(parent_package_id);
create index idx_traveler_packages_package_category_id on traveler_packages(package_category_id);


-- Trips table
create table trips (
    id bigserial primary key,
    pack_user_id bigint not null references pack_users(id) on delete cascade,
    trip_status_id bigint not null references trip_status(id) on delete cascade,
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
create index idx_trips_user_id on trips(pack_user_id);
create index idx_trips_trip_status_id on trips(trip_status_id);

create table trip_travelers (
    id bigserial primary key,
    trip_id bigint not null references trips(id) on delete cascade,
    traveler_id bigint not null references travelers(id) on delete cascade,
    responsible_traveler_id bigint references travelers(id), -- who is responsible for this packing
    packing_status_id bigint not null references packing_status(id) on delete cascade,
    start_date date,
    end_date date,
    packing_data jsonb not null default '{}',
    unique(trip_id, traveler_id),
    constraint ch_traveler_trip_things_start_before_end check (
        start_date is null 
        or end_date is null 
        or start_date <= end_date
    )
);

create index idx_trip_travelers_trip_id on trip_travelers(trip_id);
create index idx_trip_travelers_traveler_id on trip_travelers(traveler_id);


