SET search_path TO plantour, public;

begin;
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
    ((SELECT id FROM users WHERE email = 'alice.participant@plantour.test'), 'Hiking Pack', 'Osprey 65L'),
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
-- INVITATIONS
-----------------------------------------------------------------------
INSERT INTO invitations (trip_id, token, first_name, last_name, email, subject, message, expires_at, communication_type)
VALUES
    (
        (SELECT id FROM trips WHERE name = 'Summer Alps Expedition 2026'),
        'token_xyz_123',
        'Alice',
        'Participant',
        'alice.participant@plantour.test',
        'You are invited to the Alps!',
        'Hey Alice, join our mountain trip this summer.',
        NOW() + INTERVAL '7 days',
        'email'
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
INSERT INTO trip_shared_things (trip_id, category, name, units, value, notes, added_by_id)
VALUES
    (
        (SELECT trip_id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Clothing',
        'Rain Jacket',
        'pcs',
        1,
        'Essential for mountains',
        (SELECT id FROM trip_users WHERE notes = 'Serguru is the admin and the participant')
    ),
    (
        (SELECT trip_id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Fishing',
        'Talles',
        'pcs',
        1,
        'Essential for ocean',
        (SELECT id FROM trip_users WHERE notes = 'Serguru is the admin and the participant')
    ),
    (
        (SELECT trip_id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Clothing',
        'Rain Long Jacket',
        'pcs',
        1,
        'Essential for mountains',
        (SELECT id FROM trip_users WHERE notes = 'Serguru is the admin and the participant')
    ),
    (
        (SELECT trip_id FROM trip_users WHERE notes = 'Serguru is the admin and the participant'),
        'Electronics',
        'Headlamp',
        'pcs',
        1,
        'Check batteries before leaving',
        (SELECT id FROM trip_users WHERE notes = 'Serguru is the admin and the participant')
    );

commit;