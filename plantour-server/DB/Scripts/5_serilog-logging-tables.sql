-- serilog postgresql logging tables
-- this script creates the necessary tables for storing serilog logs in postgresql
set search_path to plantour, public;

-- main logs table
create table if not exists plantour.logs (
    id serial primary key,
    message_template text,
    level varchar(128),
    time_stamp timestamp not null,
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
