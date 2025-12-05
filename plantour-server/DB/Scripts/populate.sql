
set search_path to plantour, public;

begin;

-- ====================================================================
-- USERS (1 admin + 2 participants + 2 extra users)
-- ====================================================================
INSERT INTO users (email, password_hash, password_salt, first_name, last_name, phone, notes)
VALUES
    (
        'serguru@gmail.com',
        '\x35c846498f41a7ed1513b765c264ab222f7c3b015163fc07c78f6af00554436d2bb8f3d105a848584a0103f228132affc301505136188d50194e14f9a32d0f64',
        '\x727465da121430b0bf747ea4a4cc3c21f458c61b824b15d354fc8e10adb5d2a7e82a3aa26363d48178341995f078275e2d5b3c5df70536c6af73a6dff32e15b7',
        'Admin',
        'User',
        '+1-604-000-0000',
        'Primary admin test user'
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
INSERT INTO admins_participants (id, admin_id, participant_id, access_code)
VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'ALC12345'
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'BOB54321'
    );


-- ====================================================================
-- REFRESH TOKENS (sample data)
-- ====================================================================
INSERT INTO refresh_tokens (user_id, token, expires_at)
VALUES
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'admin-refresh-token-sample-1',
        now() + interval '30 days'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'alice-refresh-token-sample-1',
        now() + interval '20 days'
    );


-- ====================================================================
-- USER PACKAGES (realistic household names)
-- ====================================================================
INSERT INTO user_packages (user_id, name, description)
VALUES
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Yellow suitcase',
        'Large yellow checked suitcase 23 kg limit'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Black carry-on backpack',
        'Everyday carry-on backpack for cabin luggage'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Small electronics pouch',
        'Cable organizer for chargers and adapters'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Blue cabin suitcase',
        'Medium blue suitcase for short trips'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Daypack 20L',
        'Lightweight daypack for excursions'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Grey business trolley',
        'Carry-on trolley for business travel'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Laptop backpack',
        'Backpack with padded laptop compartment'
    ),
    (
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'Red hiking backpack 40L',
        'Backpack for weekend hiking trips'
    ),
    (
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'Black duffel bag 60L',
        'Large duffel bag for road trips'
    );


-- ====================================================================
-- USER THINGS (realistic household items)
-- ====================================================================
INSERT INTO user_things (user_id, category_id, name, description, units_id)
VALUES
    -- Admin user things
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Documents'),
        'Passport',
        'Canadian passport with travel cover',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Documents'),
        'Travel insurance printout',
        'Printed copy of travel insurance policy',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Yellow T-shirt',
        'Light cotton T-shirt for warm weather',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Jeans',
        'Comfortable blue jeans for travel days',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Electronics'),
        'Smartphone charger',
        'USB-C phone charger with cable',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Electronics'),
        'Laptop',
        '15-inch laptop for work and entertainment',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Toiletries'),
        'Toothbrush',
        'Soft travel toothbrush in plastic case',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Toiletries'),
        'Toothpaste',
        'Travel size toothpaste 75 ml',
        (SELECT id FROM units WHERE name = 'ml')
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        (SELECT id FROM thing_categories WHERE name = 'Health & Hygiene'),
        'Sunscreen SPF 50',
        'Water-resistant sunscreen for beach days',
        (SELECT id FROM units WHERE name = 'ml')
    ),

    -- Alice things
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Swimsuit',
        'One-piece swimsuit for the beach',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Footwear'),
        'Flip-flops',
        'Rubber flip-flops for the pool and beach',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Light summer dress',
        'Casual dress for evenings',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Toiletries'),
        'Hairbrush',
        'Compact travel hairbrush',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Personal Care'),
        'Makeup pouch',
        'Small pouch with basic makeup items',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Electronics'),
        'E-book reader',
        'E-book reader for reading on the beach',
        (SELECT id FROM units WHERE name = 'pcs')
    ),

    -- Bob things
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Business suit',
        'Dark blue suit for meetings',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Footwear'),
        'Dress shoes',
        'Black leather shoes for formal events',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Electronics'),
        'Laptop power adapter',
        'Original power adapter for work laptop',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Documents'),
        'Boarding passes printout',
        'Printed boarding passes for all flights',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Travel Essentials'),
        'Neck pillow',
        'Memory foam neck pillow for long flights',
        (SELECT id FROM units WHERE name = 'pcs')
    ),

    -- Carol things
    (
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Outdoor & Sports'),
        'Hiking poles',
        'Adjustable trekking poles for mountain trails',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Footwear'),
        'Hiking boots',
        'Waterproof hiking boots with good grip',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Rain jacket',
        'Lightweight waterproof shell jacket',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Emergency & First Aid'),
        'First aid kit',
        'Compact first aid kit for hiking',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Outdoor & Sports'),
        'Headlamp',
        'LED headlamp with extra batteries',
        (SELECT id FROM units WHERE name = 'pcs')
    ),

    -- Dave things
    (
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Electronics'),
        'Mirrorless camera',
        'Travel camera with kit lens',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Electronics'),
        'Camera tripod',
        'Lightweight travel tripod',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Accessories'),
        'Sunglasses',
        'Polarized sunglasses with case',
        (SELECT id FROM units WHERE name = 'pcs')
    ),
    (
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Hoodie',
        'Comfortable hoodie for cooler evenings',
        (SELECT id FROM units WHERE name = 'pcs')
    );


-- ====================================================================
-- TRIPS (medium-sized set, mixed themes)
-- ====================================================================
INSERT INTO trips (user_id, trip_status, name, description, start_date, end_date)
VALUES
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Planning',
        'Family Beach Vacation in Mexico',
        'One-week family vacation at an all-inclusive resort in Cancun.',
        DATE '2025-02-10',
        DATE '2025-02-17'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Active',
        'Weekend Hiking in Garibaldi Park',
        'Two-night hiking and camping trip with friends in Garibaldi Provincial Park.',
        DATE '2025-07-04',
        DATE '2025-07-06'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Planning',
        'Business Trip to Toronto',
        'Four-day business trip with client meetings and one free evening downtown.',
        DATE '2025-03-12',
        DATE '2025-03-16'
    ),
    (
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'Planning',
        'Road Trip Vancouver to Calgary',
        'Five-day road trip through the Rockies visiting Banff and Lake Louise.',
        DATE '2025-08-01',
        DATE '2025-08-05'
    );


-- ====================================================================
-- TRIP USERS (who participates in which trip)
-- ====================================================================
INSERT INTO trip_users (trip_id, user_id, notes)
VALUES
    -- Family Beach Vacation in Mexico
    (
        (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico'),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Trip organizer and main contact'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Joining as a guest, sharing family room'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Responsible for organizing airport transfers'
    ),

    -- Weekend Hiking in Garibaldi Park
    (
        (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Trip owner and gear coordinator'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'Leading the hiking route'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park'),
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'Photographer for the trip'
    ),

    -- Business Trip to Toronto
    (
        (SELECT id FROM trips WHERE name = 'Business Trip to Toronto'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Trip owner and main presenter'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Business Trip to Toronto'),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Supporting colleague for key meetings'
    ),

    -- Road Trip Vancouver to Calgary
    (
        (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'Driver and trip organizer'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary'),
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'Navigation and photo stops planning'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary'),
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Backup driver and accommodation booking'
    );


-- ====================================================================
-- INVITATIONS (realistic email/SMS invitations)
-- ====================================================================
INSERT INTO invitations (
    trip_id,
    token,
    first_name,
    last_name,
    email,
    phone,
    subject,
    message,
    created_at,
    expires_at,
    accepted_at,
    refused_at,
    sent_at,
    communication_type,
    notes
)
VALUES
    -- Mexico beach vacation invitations
    (
        (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico'),
        'inv-mexico-alice-001',
        'Alice',
        'Participant',
        'alice.participant@plantour.test',
        '+1-604-000-0001',
        'Join our family beach vacation in Mexico',
        'Hi Alice, we are going to Cancun in February. Join our Family Beach Vacation in Plantour to see the packing list and schedule.',
        now() - interval '15 days',
        now() + interval '15 days',
        now() - interval '10 days',
        NULL,
        now() - interval '14 days',
        'email',
        'Accepted two days after email was sent.'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico'),
        'inv-mexico-bob-001',
        'Bob',
        'Participant',
        'bob.participant@plantour.test',
        '+1-604-000-0002',
        'Airport transfer planning for Mexico trip',
        'Hi Bob, please join the Mexico trip in Plantour so we can coordinate airport transfers and arrival times.',
        now() - interval '12 days',
        now() + interval '18 days',
        NULL,
        NULL,
        now() - interval '11 days',
        'email',
        'Pending response.'
    ),

    -- Garibaldi hiking invitations
    (
        (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park'),
        'inv-garibaldi-dave-001',
        'Dave',
        'Tester',
        'dave.tester@plantour.test',
        '+1-604-000-0004',
        'Garibaldi hiking weekend invitation',
        'Hi Dave, we are planning a hiking weekend in Garibaldi. Join the trip in Plantour and upload your gear list.',
        now() - interval '5 days',
        now() + interval '25 days',
        now() - interval '3 days',
        NULL,
        now() - interval '4 days',
        'WhatsApp',
        'Accepted quickly via WhatsApp link.'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park'),
        'inv-garibaldi-extra-001',
        'John',
        'Hiker',
        'john.hiker@example.com',
        '+1-604-555-0000',
        'Spare spot on Garibaldi hike',
        'Hi John, we have one extra spot on our Garibaldi hiking weekend. Join via this Plantour invite to see the shared packing list.',
        now() - interval '4 days',
        now() + interval '20 days',
        NULL,
        NULL,
        now() - interval '4 days',
        'SMS',
        'External guest not yet registered.'
    ),

    -- Business trip invitations
    (
        (SELECT id FROM trips WHERE name = 'Business Trip to Toronto'),
        'inv-toronto-admin-001',
        'Admin',
        'User',
        'serguru@gmail.com',
        '+1-604-000-0000',
        'Support on Toronto business trip',
        'We would like you to join the Toronto business trip in Plantour to help with presentations and logistics.',
        now() - interval '20 days',
        now() + interval '10 days',
        now() - interval '18 days',
        NULL,
        now() - interval '19 days',
        'email',
        'Admin accepted quickly.'
    ),

    -- Road trip invitations
    (
        (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary'),
        'inv-roadtrip-dave-001',
        'Dave',
        'Tester',
        'dave.tester@plantour.test',
        '+1-604-000-0004',
        'Vancouver to Calgary road trip plans',
        'Hi Dave, join the Vancouver to Calgary road trip in Plantour to coordinate camping spots and photo stops.',
        now() - interval '3 days',
        now() + interval '27 days',
        now() - interval '2 days',
        NULL,
        now() - interval '3 days',
        'Telegram',
        'Accepted after checking vacation dates.'
    );


-- ====================================================================
-- TRIP USER PACKAGES (instantiated per trip user)
-- ====================================================================
INSERT INTO trip_user_packages (
    parent_package_id,
    trip_user_id,
    name,
    label,
    notes,
    packing_status,
    packed_at,
    packing_list_included,
    weight_value,
    weight_unit
)
VALUES
    -- Mexico trip: admin packages
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Yellow suitcase',
        'Checked bag',
        'Main checked luggage with clothes and toiletries.',
        'Planning',
        NULL,
        true,
        18.500,
        'kg'
    ),
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Black carry-on backpack',
        'Carry-on',
        'Carry-on backpack with documents and electronics.',
        'Active',
        now() - interval '1 day',
        true,
        7.200,
        'kg'
    ),
    (
        (SELECT id FROM trip_user_packages WHERE name = 'Black carry-on backpack'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Small electronics pouch',
        'Cables & chargers',
        'Pouch with chargers, cables and adapters.',
        'Active',
        now() - interval '1 day',
        true,
        0.800,
        'kg'
    ),

    -- Mexico trip: Alice package
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'alice.participant@plantour.test')),
        'Blue cabin suitcase',
        'Alice suitcase',
        'Alice''s main suitcase for the beach vacation.',
        'Planning',
        NULL,
        true,
        15.000,
        'kg'
    ),

    -- Garibaldi hiking: Alice & Carol & Dave
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park')
                                 AND user_id = (SELECT id FROM users WHERE email = 'alice.participant@plantour.test')),
        'Daypack 20L',
        'Alice daypack',
        'Daypack with snacks, water and extra layers.',
        'Active',
        now() - interval '2 days',
        true,
        5.000,
        'kg'
    ),
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park')
                                 AND user_id = (SELECT id FROM users WHERE email = 'carol.tester@plantour.test')),
        'Red hiking backpack 40L',
        'Main pack',
        'Hiking backpack with tent and shared gear.',
        'Planning',
        NULL,
        true,
        12.300,
        'kg'
    ),
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park')
                                 AND user_id = (SELECT id FROM users WHERE email = 'dave.tester@plantour.test')),
        'Black duffel bag 60L',
        'Camera & camping gear',
        'Duffel bag with camera gear and clothing.',
        'Planning',
        NULL,
        true,
        10.750,
        'kg'
    ),

    -- Business trip: Bob
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                 AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test')),
        'Grey business trolley',
        'Cabin trolley',
        'Business trolley with suit and documents.',
        'Planning',
        NULL,
        true,
        9.500,
        'kg'
    ),
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                 AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test')),
        'Laptop backpack',
        'Work backpack',
        'Laptop backpack with electronics and chargers.',
        'Planning',
        NULL,
        true,
        6.200,
        'kg'
    ),

    -- Road trip: Carol & Dave
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary')
                                 AND user_id = (SELECT id FROM users WHERE email = 'carol.tester@plantour.test')),
        'Red hiking backpack 40L',
        'Carol road trip pack',
        'Backpack with clothing and hiking gear for stops.',
        'Planning',
        NULL,
        true,
        11.000,
        'kg'
    ),
    (
        NULL,
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary')
                                 AND user_id = (SELECT id FROM users WHERE email = 'dave.tester@plantour.test')),
        'Black duffel bag 60L',
        'Dave road trip bag',
        'Duffel bag with clothes and camera equipment.',
        'Planning',
        NULL,
        true,
        13.400,
        'kg'
    );


-- ====================================================================
-- TRIP USER THINGS (items placed into trip user packages)
-- ====================================================================
INSERT INTO trip_user_things (
    trip_user_id,
    category,
    name,
    units,
    value,
    notes,
    trip_user_package_id,
    packing_status,
    packed_at
)
VALUES
    -- Mexico trip: admin items
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Documents',
        'Passport',
        'pcs',
        1.000,
        'Keep in carry-on backpack.',
        (SELECT id FROM trip_user_packages WHERE name = 'Black carry-on backpack'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        'Completed',
        now() - interval '1 day'
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Documents',
        'Travel insurance printout',
        'pcs',
        1.000,
        'Printed copy in document folder in backpack.',
        (SELECT id FROM trip_user_packages WHERE name = 'Black carry-on backpack'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        'Active',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Clothing',
        'Yellow T-shirt',
        'pcs',
        3.000,
        'Three T-shirts packed into the yellow suitcase.',
        (SELECT id FROM trip_user_packages WHERE name = 'Yellow suitcase'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Clothing',
        'Jeans',
        'pcs',
        2.000,
        'Two pairs of jeans in checked suitcase.',
        (SELECT id FROM trip_user_packages WHERE name = 'Yellow suitcase'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Electronics',
        'Smartphone charger',
        'pcs',
        1.000,
        'Charger in electronics pouch in carry-on.',
        (SELECT id FROM trip_user_packages WHERE name = 'Small electronics pouch'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        'Completed',
        now() - interval '1 day'
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Electronics',
        'Laptop',
        'pcs',
        1.000,
        'Laptop packed into padded compartment of backpack.',
        (SELECT id FROM trip_user_packages WHERE name = 'Black carry-on backpack'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        'Active',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Toiletries',
        'Toothbrush',
        'pcs',
        1.000,
        'Toiletry bag inside yellow suitcase.',
        (SELECT id FROM trip_user_packages WHERE name = 'Yellow suitcase'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')),
        'Health & Hygiene',
        'Sunscreen SPF 50',
        'ml',
        150.000,
        'Full bottle of sunscreen in checked baggage.',
        (SELECT id FROM trip_user_packages WHERE name = 'Yellow suitcase'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com'))),
        'Planning',
        NULL
    ),

    -- Mexico trip: Alice items
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'alice.participant@plantour.test')),
        'Clothing',
        'Swimsuit',
        'pcs',
        2.000,
        'Two swimsuits packed in blue cabin suitcase.',
        (SELECT id FROM trip_user_packages WHERE name = 'Blue cabin suitcase'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                 AND user_id = (SELECT id FROM users WHERE email = 'alice.participant@plantour.test')),
        'Footwear',
        'Flip-flops',
        'pcs',
        1.000,
        'Flip-flops for the pool and beach.',
        (SELECT id FROM trip_user_packages WHERE name = 'Blue cabin suitcase'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Beach Vacation in Mexico')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'))),
        'Planning',
        NULL
    ),

    -- Garibaldi hiking: Carol items
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park')
                                 AND user_id = (SELECT id FROM users WHERE email = 'carol.tester@plantour.test')),
        'Outdoor & Sports',
        'Hiking poles',
        'pcs',
        2.000,
        'Pair of trekking poles strapped to backpack.',
        (SELECT id FROM trip_user_packages WHERE name = 'Red hiking backpack 40L'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park')
                                 AND user_id = (SELECT id FROM users WHERE email = 'carol.tester@plantour.test')),
        'Footwear',
        'Hiking boots',
        'pcs',
        1.000,
        'Boots worn on travel days, not packed.',
        NULL,
        'Active',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park')
                                 AND user_id = (SELECT id FROM users WHERE email = 'carol.tester@plantour.test')),
        'Emergency & First Aid',
        'First aid kit',
        'pcs',
        1.000,
        'Shared first aid kit for the group.',
        (SELECT id FROM trip_user_packages WHERE name = 'Red hiking backpack 40L'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend Hiking in Garibaldi Park')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'))),
        'Planning',
        NULL
    ),

    -- Business trip: Bob items
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                 AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test')),
        'Clothing',
        'Business suit',
        'pcs',
        1.000,
        'Suit packed in garment section of business trolley.',
        (SELECT id FROM trip_user_packages WHERE name = 'Grey business trolley'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                 AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test')),
        'Footwear',
        'Dress shoes',
        'pcs',
        1.000,
        'Shoes in shoe bag inside trolley.',
        (SELECT id FROM trip_user_packages WHERE name = 'Grey business trolley'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                 AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test')),
        'Electronics',
        'Laptop power adapter',
        'pcs',
        1.000,
        'Power adapter in laptop backpack.',
        (SELECT id FROM trip_user_packages WHERE name = 'Laptop backpack'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                 AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test')),
        'Travel Essentials',
        'Neck pillow',
        'pcs',
        1.000,
        'Neck pillow clipped to backpack handle.',
        (SELECT id FROM trip_user_packages WHERE name = 'Laptop backpack'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Business Trip to Toronto')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'))),
        'Active',
        NULL
    ),

    -- Road trip: Dave items
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary')
                                 AND user_id = (SELECT id FROM users WHERE email = 'dave.tester@plantour.test')),
        'Electronics',
        'Mirrorless camera',
        'pcs',
        1.000,
        'Camera stored in padded insert in duffel bag.',
        (SELECT id FROM trip_user_packages WHERE name = 'Black duffel bag 60L'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary')
                                 AND user_id = (SELECT id FROM users WHERE email = 'dave.tester@plantour.test')),
        'Electronics',
        'Camera tripod',
        'pcs',
        1.000,
        'Tripod strapped to the side of duffel bag.',
        (SELECT id FROM trip_user_packages WHERE name = 'Black duffel bag 60L'
             AND trip_user_id = (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary')
                                                       AND user_id = (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'))),
        'Planning',
        NULL
    ),
    (
        (SELECT id FROM trip_users WHERE trip_id = (SELECT id FROM trips WHERE name = 'Road Trip Vancouver to Calgary')
                                 AND user_id = (SELECT id FROM users WHERE email = 'dave.tester@plantour.test')),
        'Accessories',
        'Sunglasses',
        'pcs',
        1.000,
        'Sunglasses case in car glove compartment.',
        NULL,
        'Active',
        NULL
    );

commit;