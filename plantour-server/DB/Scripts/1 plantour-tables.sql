drop schema if exists plantour cascade;

create schema plantour;

set search_path to plantour, public;

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

-- TODO: Send a list of items to the AI for the expertise


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
    first_name text,
    last_name text,
    phone text,
    notes text,
    created_at timestamp not null default (now() at time zone 'utc'),
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
    created_at timestamp not null default (now() at time zone 'utc')
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
    category text,
    name text not null,
    units text,
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
    start_date date,
    end_date date,
    created_at timestamp not null default (now() at time zone 'utc'),
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
    first_name text,
    last_name text,
    email text,
    phone text,

    subject text not null,
    message text not null,

    created_at timestamp not null default (now() at time zone 'utc'),
    expires_at timestamp not null,
    accepted_at timestamp,
    refused_at timestamp,
    sent_at timestamp,

    communication_type text,

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
    packaging_complete boolean not null default(false),  
    notes text,
    nopack_weight_value decimal(10,3) check(nopack_weight_value > 0),
    nopack_weight_unit text
);
create unique index idx_trip_users_trip_id_user_id on trip_users(trip_id, admin_participant_id);

-----------------------------------------------------------------------
-- TRIP USER PACKAGES
-- TODO: Add UI for weight
-----------------------------------------------------------------------
create table trip_user_packages (
    id uuid not null primary key default gen_random_uuid(),
    trip_user_id uuid not null references trip_users(id) on delete cascade,
    name text not null,
    label text,
    notes text,
    packing_list_included boolean not null default(false),
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
    finished_at timestamp,
    finished text null check (finished in ('success', 'failure') or finished is null)
);
create unique index idx_trip_user_things_trip_user_id_name on trip_user_things(trip_user_id, name);

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
    assigned_at timestamp null,
    assigned_deadline timestamp null,
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
    published_at timestamp not null
);
create index idx_trip_comments_trip_id on trip_comments(trip_id);

-----------------------------------------------------------------------
-- USER EMAIL CONFIRMATIONS
-----------------------------------------------------------------------
create table user_email_confirmations (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    created_at timestamp not null default (now() at time zone 'utc'),
    confirmed_at timestamp null,
    last_sent_at timestamp null
);
create unique index idx_user_email_confirmations_user_id on user_email_confirmations(user_id);

-----------------------------------------------------------------------
-- USER REFRESH TOKENS
-----------------------------------------------------------------------
create table user_refresh_tokens (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    role text not null,
    admin_id uuid not null,
    token_hash text not null,
    created_at timestamp not null default (now() at time zone 'utc'),
    expires_at timestamp not null,
    revoked_at timestamp null,
    replaced_by_token_hash text null,
    created_by_ip text null,
    revoked_by_ip text null
);
create unique index idx_user_refresh_tokens_user_token_hash on user_refresh_tokens(user_id, token_hash);
create index idx_user_refresh_tokens_token_hash on user_refresh_tokens(token_hash);
create index idx_user_refresh_tokens_user_id on user_refresh_tokens(user_id);


create table contact_submissions (
    -- identification
    id uuid primary key default gen_random_uuid(),
    
    -- core data
    full_name text not null,
    email varchar(255) not null check (email ~* '^[a-za-z0-9._%+-]+@[a-za-z0-9.-]+\.[a-za-z]{2,}$'),
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
    created_at timestamp not null default (now() at time zone 'utc')
);

-- indexes for performance
create index idx_contact_email on contact_submissions(email);
create index idx_contact_status on contact_submissions(contact_status);


create table ai_prompts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    prompt text not null,
    created_at timestamp not null default (now() at time zone 'utc')
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


-- serilog postgresql logging tables
-- this script creates the necessary tables for storing serilog logs in postgresql

-- main logs table
create table if not exists plantour.logs (
    id serial primary key,
    message_template text,
    level text,
    time_stamp timestamp not null default (now() at time zone 'utc'),
    exception text,
    log_event text,
    properties jsonb
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
    is 'timestamp when the log event was recorded';

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
    created_at timestamp not null default (now() at time zone 'utc'),
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
    description text,
    updated_at timestamp not null default (now() at time zone 'utc')
);

insert into plantour.settings (key, value, value_type)
values 
    ('guest_plan_name', 'Guest', 'string'),
    ('trial_plan_name', 'Starter', 'string'),
    ('base_plan_name', 'Family', 'string'),
    ('pro_plan_name', 'Expedition', 'string'),
    ('base_plan_monthly_cents', '499', 'integer'),
    ('base_plan_yearly_cents', '2999', 'integer'),
    ('pro_plan_monthly_cents', '1499', 'integer'),
    ('pro_plan_yearly_cents', '8999', 'integer'),
    ('user_email_confirmation_url', 'http://localhost:4203/confirm-email', 'string'),
    ('guest_plan_duration_days', '14', 'integer'),
    ('email_confirmation_token_minutes', '60',  'integer'),
    ('user_token_expiration_minutes', '1440',  'integer'),
    ('user_refresh_token_expiration_days', '30',  'integer');
    
    
