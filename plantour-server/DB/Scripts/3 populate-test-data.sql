SET search_path TO plantour, public;

begin;


-- ====================================================================
-- USERS (2 admins + 2 participants + 2 extra users)
-- ====================================================================
INSERT INTO users (email, first_name, last_name, phone, notes, access_type_id)
VALUES
    (
        'serguru@gmail.com',

        'Serge',
        'Cherny',
        '+1-604-000-0000',
        'Primary admin user',
        (select id from plantour.access_types where name = 'Active')
    ),
    (
        'sechevan@gmail.com',
        'Bill',
        'Gates',
        '+1-604-000-0001',
        'Secondary admin test user',
        (select id from plantour.access_types where name = 'Active')
    ),
    (
        'alice.participant@plantour.test',
        'Alice',
        'Participant',
        '+1-604-000-0001',
        'First participant linked to admin',
        (select id from plantour.access_types where name = 'Active')
    ),
    (
        'bob.participant@plantour.test',
        'Bob',
        'Participant',
        '+1-604-000-0002',
        'Second participant linked to admin',
        (select id from plantour.access_types where name = 'Active')
    ),
    (
        'carol.tester@plantour.test',
        'Carol',
        'Tester',
        '+1-604-000-0003',
        'Extra test user',
        (select id from plantour.access_types where name = 'Active')
    ),
    (
        'dave.tester@plantour.test',
        'Dave',
        'Tester',
        '+1-604-000-0004',
        'Extra test user',
        (select id from plantour.access_types where name = 'Active')
    );


-- ====================================================================
-- ADMINS / PARTICIPANTS LINKS
-- ====================================================================
INSERT INTO admins_participants (id, admin_id, participant_id,access_code_hash, notes)
VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'a',
        'Same participant as admin'
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'aa',
        'First participant linked to admin'

    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'b',
        'Second participant linked to admin'
    );




-----------------------------------------------------------------------
-- USER THINGS
-----------------------------------------------------------------------
INSERT INTO user_things (user_id, category, name, units, value, notes)
VALUES
    ((SELECT id FROM users WHERE email = 'serguru@gmail.com'), 'Electronics', 'MacBook Pro 14', 'pcs', 1, 'Main work laptop'),
    ((SELECT id FROM users WHERE email = 'serguru@gmail.com'), 'Travel Essentials', 'Passport', 'pcs', 1, 'Valid until 2028'),
    ((SELECT id FROM users WHERE email = 'serguru@gmail.com'), 'Toiletries', 'Electric Toothbrush', 'pcs', 1, 'Sonicare'),
    ((SELECT id FROM users WHERE email = 'alice.participant@plantour.test'), 'Clothing', 'Rain Jacket', 'pcs', 1, 'Gore-Tex shell'),
    ((SELECT id FROM users WHERE email = 'alice.participant@plantour.test'), 'Health & Hygiene', 'Sunscreen SPF 50', 'ml', 200, 'Water resistant'),
    ((SELECT id FROM users WHERE email = 'bob.participant@plantour.test'), 'Footwear', 'Hiking Boots', 'pcs', 1, 'Salomon Quest'),
    ((SELECT id FROM users WHERE email = 'bob.participant@plantour.test'), 'Electronics', 'Power Bank 20000mAh', 'pcs', 1, 'Anker');

-----------------------------------------------------------------------
-- USER PACKAGES
-----------------------------------------------------------------------
INSERT INTO user_packages (user_id, name, notes)
VALUES
    ((SELECT id FROM users WHERE email = 'serguru@gmail.com'), 'Yellow Suitcase', 'Large hardshell Samsonite'),
    ((SELECT id FROM users WHERE email = 'serguru@gmail.com'), 'Black Backpack', 'Daily carry North Face'),
    ((SELECT id FROM users WHERE email = 'alice.participant@plantour.test'), 'Hiking Bag', 'Osprey 65L'),
    ((SELECT id FROM users WHERE email = 'bob.participant@plantour.test'), 'Duffel Bag', 'Waterproof Patagonia');

-----------------------------------------------------------------------
-- TRIPS
-----------------------------------------------------------------------
INSERT INTO trips (user_id, trip_status_id, name, notes, start_date, end_date)
VALUES
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM trip_status WHERE name = 'Preparation'),
        'Summer Alps Expedition 2026',
        'Hiking and sightseeing in the Swiss Alps',
        '2026-07-15',
        '2026-07-30'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM trip_status WHERE name = 'Planning'),
        'Weekend in Prague',
        'Exploring the old town and local cuisine',
        '2026-10-02',
        '2026-10-04'
    );

-----------------------------------------------------------------------
-- TRIP USERS
-----------------------------------------------------------------------
INSERT INTO trip_users (trip_id, admin_participant_id, notes)
VALUES
    (
        (SELECT id FROM trips WHERE name = 'Summer Alps Expedition 2026'),
        (SELECT id FROM admins_participants WHERE admin_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com') 
         AND participant_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Serguru is the admin and the participant'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Summer Alps Expedition 2026'),
        (SELECT id FROM admins_participants WHERE admin_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com') 
         AND participant_id = (SELECT id FROM users WHERE email = 'alice.participant@plantour.test')),
        'Alice is the primary navigator'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Summer Alps Expedition 2026'),
        (SELECT id FROM admins_participants WHERE admin_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com') 
         AND participant_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test')),
        'Bob handles the logistics'
    );

-----------------------------------------------------------------------
-- TRIP USER PACKAGES
-----------------------------------------------------------------------
INSERT INTO trip_user_packages (trip_user_id, name, label, packing_list_included, weight_value, weight_unit)
VALUES
    (
        (SELECT id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Large Box',
        'A1',
        true,
        12.5,
        'kg'
    ),
    (
        (SELECT id FROM trip_users WHERE notes = 'Alice is the primary navigator'),
        'Yellow Suitcase',
        'X1',
        true,
        12.5,
        'kg'
    );

-----------------------------------------------------------------------
-- TRIP USER THINGS
-----------------------------------------------------------------------
INSERT INTO trip_user_things (trip_user_id, category, name, units, value, notes, trip_user_package_id)
VALUES
    (
        (SELECT id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Clothing',
        'Rain Jacket',
        'pcs',
        1,
        'Essential for mountains',
        (SELECT id FROM trip_user_packages WHERE name = 'Large Box')
    ),
    (
        (SELECT id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Fishing',
        'Talles',
        'pcs',
        1,
        'Essential for ocean',
        null
    ),
    (
        (SELECT id FROM trip_users WHERE notes = 'Alice is the primary navigator'),
        'Clothing',
        'Rain Jacket',
        'pcs',
        1,
        'Essential for mountains',
        (SELECT id FROM trip_user_packages WHERE name = 'Yellow Suitcase')
    ),
    (
        (SELECT id FROM trip_users WHERE notes = 'Alice is the primary navigator'),
        'Electronics',
        'Headlamp',
        'pcs',
        1,
        'Check batteries before leaving',
        (SELECT id FROM trip_user_packages WHERE name = 'Yellow Suitcase')
    );

-----------------------------------------------------------------------
-- TRIP SHARED THINGS
-----------------------------------------------------------------------
INSERT INTO trip_shared_things (trip_id, category, name, units, value, notes)
VALUES
    (
        (SELECT trip_id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Clothing',
        'Rain Jacket',
        'pcs',
        1,
        'Essential for mountains'
    ),
    (
        (SELECT trip_id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Fishing',
        'Talles',
        'pcs',
        1,
        'Essential for ocean'
    ),
    (
        (SELECT trip_id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Clothing',
        'Rain Long Jacket',
        'pcs',
        1,
        'Essential for mountains'
    ),
    (
        (SELECT trip_id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Electronics',
        'Headlamp',
        'pcs',
        1,
        'Check batteries before leaving'
    );

commit;