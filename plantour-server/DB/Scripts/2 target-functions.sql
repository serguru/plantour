set search_path to plantour, public;

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

--#region insert_trip_user_things
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
--#endregion

--#region delete_trip_user_things
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
--#endregion

--#region  insert_trip_users
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
--#endregion

--#region delete_trip_users
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
--#endregion

--#region pack_trip_things
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
--#endregion

--#region insert_trip_shared_things
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
--#endregion

--#region delete_trip_shared_things
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
--#endregion



--#region insert_template_trip_shared_things
-- insert from template_things to trip_shared_things
create or replace function plantour.insert_template_trip_shared_things(
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
    from plantour.template_things b
    left join 
        (
            select b.name as name
            from plantour.trips a
            join plantour.trip_shared_things b on a.id = b.trip_id
            where 
                b.trip_id = p_trip_id and
                a.user_id = p_admin_id
        ) c on lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        b.id = any (p_ids)
        and c.name is null;

    get diagnostics v_inserted_count = row_count;

    return v_inserted_count;
end;
$$;
--#endregion

--#region delete_template_trip_shared_things
-- delete from template_things to trip_shared_things
create or replace function plantour.delete_template_trip_shared_things(
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
    using 
        plantour.template_things b,
        plantour.trips d
    where
        -- Link target 'a' to 'b' and 'd' via name and trip_id
        lower(a.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
        and a.trip_id = d.id
        -- Apply filters
        and b.id = any (p_ids)
        and d.user_id = p_admin_id
        and d.id = p_trip_id;

    get diagnostics v_deleted_count = row_count;

    return v_deleted_count;
end;
$$;
--#endregion


--#region insert_template_trip_user_things
-- insert from template_things to trip_user_things
create or replace function plantour.insert_template_trip_user_things(
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

    insert into plantour.trip_user_things (trip_user_id, category, name, units, value)
    select
        v_trip_user_id,
        b.category,
        b.name,
        b.units,
        b.value
    from plantour.template_things b
    left join plantour.trip_user_things c on 
        c.trip_user_id = v_trip_user_id and 
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        b.id = any (p_ids)
        and c.id is null;

    get diagnostics v_inserted_count = row_count;

    return v_inserted_count;
end;
$$;
--#endregion

--#region delete_template_trip_user_things
-- delete from template_things to trip_user_things
create or replace function plantour.delete_template_trip_user_things(
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
    using plantour.template_things b
    join plantour.trip_user_things c on 
        c.trip_user_id = v_trip_user_id and 
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        a.id = c.id and
        b.id = any (p_ids);

    get diagnostics v_deleted_count = row_count;

    return v_deleted_count;
end;
$$;
--#endregion


--#region insert_template_user_things
-- insert from template_things to user_things
create or replace function plantour.insert_template_user_things(
    p_user_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_inserted_count integer;
begin
    insert into plantour.user_things (user_id, category, name, units, value)
    select
        p_user_id,
        b.category,
        b.name,
        b.units,
        b.value
    from plantour.template_things b
    left join plantour.user_things c on 
        c.user_id = p_user_id and
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        b.id = any (p_ids)
        and c.id is null;

    get diagnostics v_inserted_count = row_count;

    return v_inserted_count;
end;
$$;
--#endregion

--#region delete_template_user_things
-- delete from template_things to user_things
create or replace function plantour.delete_template_user_things(
    p_user_id uuid,
    p_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
    v_deleted_count integer;
begin
    delete from plantour.user_things a
    using plantour.template_things b
    join plantour.user_things c on 
        c.user_id = p_user_id and
        lower(c.name collate "und-x-icu") = lower(b.name collate "und-x-icu")
    where
        a.id = c.id 
        and b.id = any (p_ids);

    get diagnostics v_deleted_count = row_count;

    return v_deleted_count;
end;
$$;
--#endregion
