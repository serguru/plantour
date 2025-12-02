set search_path to plantour, public;

BEGIN;

-- ====================================================================
-- Ensure thing_categories baseline demo data (idempotent)
-- ====================================================================
INSERT INTO thing_categories (name, notes) VALUES
    ('Accessories', 'Belts, hats, sunglasses, jewelry'),
    ('Baby & Kids', 'Items for children and infants'),
    ('Clothing', 'General clothing items'),
    ('Documents', 'Passports, IDs, tickets'),
    ('Electronics', 'Phones, cameras, chargers'),
    ('Emergency & First Aid', 'Medical and emergency items'),
    ('Footwear', 'Shoes, sandals, boots'),
    ('Food & Snacks', 'Non-perishable snacks and food'),
    ('Health & Hygiene', 'Soap, shampoo, sanitizer'),
    ('Laundry', 'Laundry bags, detergent'),
    ('Medicine', 'Prescription and OTC medicines'),
    ('Outdoor & Sports', 'Outdoor and sports gear'),
    ('Personal Care', 'Misc personal-care items'),
    ('Pets', 'Pet-related items'),
    ('Toiletries', 'Toothbrush, toothpaste, etc.'),
    ('Travel Essentials', 'Adapters, locks, tags')
ON CONFLICT (name) DO NOTHING;


-- ====================================================================
-- USERS (1 admin + 2 participants + 2 extra users)
-- ====================================================================
INSERT INTO users (email, password_hash, password_salt, first_name, last_name, phone, notes)
VALUES
    (
        'admin@plantour.test',
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
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'ALC12345'
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'BOB54321'
    );


-- ====================================================================
-- REFRESH TOKENS (multiple per user)
-- ====================================================================
INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, revoked_at, replaced_by_token)
VALUES
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        'admin-token-1', now() + interval '30 days', now() - interval '1 day', NULL, NULL),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        'admin-token-2', now() + interval '60 days', now(), NULL, NULL),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'alice-token-1', now() + interval '15 days', now() - interval '2 days', NULL, NULL),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'alice-token-2', now() + interval '45 days', now(), NULL, NULL),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'bob-token-1', now() + interval '20 days', now() - interval '3 days', NULL, NULL),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'bob-token-2', now() + interval '40 days', now(), NULL, NULL),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'carol-token-1', now() + interval '25 days', now(), NULL, NULL),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'carol-token-2', now() + interval '55 days', now(), NULL, NULL),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'dave-token-1', now() + interval '10 days', now() - interval '1 day', NULL, NULL),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'dave-token-2', now() + interval '35 days', now(), NULL, NULL);


-- ====================================================================
-- USER PACKAGES (3 per user = 15 rows)
-- ====================================================================
INSERT INTO user_packages (id, user_id, category_id, short_description, description)
VALUES
    -- Admin packages
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Suitcase'),
        'Admin large suitcase', 'Primary checked suitcase for admin'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Backpack'),
        'Admin carry-on backpack', 'Carry-on backpack with electronics'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Bag'),
        'Admin day bag', 'Small shoulder bag for daily use'),

    -- Alice packages
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Suitcase'),
        'Alice medium suitcase', 'Checked suitcase for Alice'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Backpack'),
        'Alice backpack', 'Backpack with clothes and snacks'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Carry on'),
        'Alice carry-on', 'Small carry-on roller'),

    -- Bob packages
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Backpack'),
        'Bob hiking backpack', 'Backpack for outdoor trips'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Bag'),
        'Bob gym bag', 'Sports and gym items'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Box'),
        'Bob equipment box', 'Hard box for fragile gear'),

    -- Carol packages
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Suitcase'),
        'Carol suitcase', 'Test suitcase for Carol'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Plastic bag'),
        'Carol plastic bag', 'Simple plastic bag for small items'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Backpack'),
        'Carol laptop backpack', 'Backpack for laptop and documents'),

    -- Dave packages
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Bag'),
        'Dave messenger bag', 'Cross-body messenger bag'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Backpack'),
        'Dave travel backpack', 'Backpack for weekend trips'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM package_categories WHERE name = 'Wrapper'),
        'Dave gift wrapper', 'Wrapper for gifts and souvenirs');


-- ====================================================================
-- USER THINGS (4 per user = 20 rows)
-- ====================================================================
INSERT INTO user_things (
    id, user_id, category_id, short_description, description
)
VALUES
    -- Admin things
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'), (SELECT id FROM thing_categories WHERE name = 'Clothing'),'Admin T-shirt', 'Basic cotton T-shirt'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'), (SELECT id FROM thing_categories WHERE name = 'Electronics'), 'Laptop', '14-inch ultrabook'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Travel Essentials'),
        'Travel adapter', 'Universal travel adapter'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Toiletries'),
        'Toiletry bag', 'Bag with basic toiletries'),

    -- Alice things
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Dress', 'Summer dress'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Footwear'),
        'Running shoes', 'Lightweight running shoes'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Health & Hygiene'),
        'Hand sanitizer', 'Travel-size hand sanitizer'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Documents'),
        'Passport', 'Canadian passport'),

    -- Bob things
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Outdoor & Sports'),
        'Hiking poles', 'Collapsible hiking poles'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Emergency & First Aid'),
        'First aid kit', 'Compact first aid kit'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Food & Snacks'),
        'Trail mix', 'Resealable bag of trail mix'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Accessories'),
        'Sunglasses', 'Polarized sunglasses'),

    -- Carol things
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Electronics'),
        'Camera', 'Mirrorless camera body'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Travel Essentials'),
        'Luggage lock', 'TSA-approved lock'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Toiletries'),
        'Travel toothbrush', 'Foldable toothbrush'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Medicine'),
        'Pain reliever', 'Small bottle of ibuprofen'),

    -- Dave things
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Clothing'),
        'Jeans', 'Regular fit jeans'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Footwear'),
        'Sandals', 'Lightweight sandals'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Travel Essentials'),
        'Power bank', '10,000 mAh power bank'),

    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM thing_categories WHERE name = 'Personal Care'),
        'Comb', 'Small travel comb');


-- ====================================================================
-- TRIPS (6 trips with different owners and statuses)
-- ====================================================================
INSERT INTO trips (
    id, owner_id, trip_status_id,
    short_description, description,
    start_date, end_date, require_weight
)
VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM trip_status WHERE name = 'Planning'),
        'Hawaii family vacation',
        'Two-week beach vacation with family in Hawaii',
        '2026-02-01', '2026-02-14', TRUE
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM trip_status WHERE name = 'Active'),
        'Weekend ski trip',
        'Skiing weekend in Whistler',
        '2026-01-15', '2026-01-18', TRUE
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM trip_status WHERE name = 'Completed'),
        'Business conference Toronto',
        'Conference trip to Toronto with meetings and networking',
        '2025-09-10', '2025-09-15', FALSE
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM trip_status WHERE name = 'Planning'),
        'Hiking Rockies',
        'Multi-day hiking trip in the Rockies',
        '2026-07-01', '2026-07-10', TRUE
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM trip_status WHERE name = 'Archived'),
        'Photography tour Europe',
        'Train and car photography tour across Europe',
        '2024-05-01', '2024-05-20', FALSE
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM trip_status WHERE name = 'Planning'),
        'Road trip USA west coast',
        'Road trip along the west coast of the USA',
        '2026-08-05', '2026-08-25', TRUE
    );


-- ====================================================================
-- TRIP USERS (participants for trips)
-- ====================================================================
INSERT INTO trip_users (id, trip_id, user_id, access_code)
VALUES
    -- Hawaii family vacation
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hawaii family vacation'),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        'HAWADM01'),
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hawaii family vacation'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'HAWALC01'),
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hawaii family vacation'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'HAWBOB01'),

    -- Weekend ski trip
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Weekend ski trip'),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        'SKIADM01'),
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Weekend ski trip'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'SKICAR01'),

    -- Business conference Toronto
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Business conference Toronto'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'TORALC01'),
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Business conference Toronto'),
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'TORDAV01'),

    -- Hiking Rockies
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hiking Rockies'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'ROKBOB01'),
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hiking Rockies'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'ROKALC01'),

    -- Photography tour Europe
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Photography tour Europe'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'EUROCAR1'),
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Photography tour Europe'),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        'EUROADM1'),

    -- Road trip USA west coast
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Road trip USA west coast'),
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'USA1DAV1'),
    (gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Road trip USA west coast'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'USA1BOB1');


-- ====================================================================
-- INVITATIONS (10 sample invitations)
-- ====================================================================
INSERT INTO invitations (
    id,
    trip_id, inviter_id, invitee_id,
    invite_token, access_code,
    first_name, last_name, email, phone,
    subject, message,
    created_at, expires_at, accepted_at, refused_at, sent_at,
    communication_type_id,
    notes
)
VALUES
    -- Accepted email invitation for Hawaii trip
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hawaii family vacation'),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'invite-token-hawaii-alice',
        'INVHWA01',
        'Alice', 'Participant', 'alice.participant@plantour.test', '+1-604-000-0001',
        'Join our Hawaii family vacation',
        'Hi Alice, please join our Hawaii trip. All details are in Plantour.',
        '2025-01-01 10:00:00+00',
        '2025-12-31 23:59:59+00',
        '2025-01-05 12:00:00+00',
        NULL,
        '2025-01-01 11:00:00+00',
        (SELECT id FROM communication_types WHERE name = 'email'),
        'Invitation accepted via email'
    ),
    -- Accepted email invitation for Hawaii trip - Bob
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hawaii family vacation'),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'invite-token-hawaii-bob',
        'INVHWB01',
        'Bob', 'Participant', 'bob.participant@plantour.test', '+1-604-000-0002',
        'Join our Hawaii family vacation',
        'Hi Bob, we are going to Hawaii, join us in Plantour.',
        '2025-01-02 09:00:00+00',
        '2025-12-31 23:59:59+00',
        '2025-01-07 15:00:00+00',
        NULL,
        '2025-01-02 09:30:00+00',
        (SELECT id FROM communication_types WHERE name = 'email'),
        'Invitation accepted via email'
    ),
    -- Refused WhatsApp invitation for Ski trip
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Weekend ski trip'),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'invite-token-ski-dave',
        'INVSKD01',
        'Dave', 'Tester', 'dave.tester@plantour.test', '+1-604-000-0004',
        'Weekend ski trip to Whistler',
        'Dave, we are planning a ski weekend in Whistler.',
        '2025-01-10 08:00:00+00',
        '2025-02-10 23:59:59+00',
        NULL,
        '2025-01-12 10:00:00+00',
        '2025-01-10 08:05:00+00',
        (SELECT id FROM communication_types WHERE name = 'WhatsApp'),
        'Invitation refused due to schedule conflict'
    ),
    -- Pending SMS invitation for Ski trip
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Weekend ski trip'),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'invite-token-ski-carol',
        'INVSKC01',
        'Carol', 'Tester', 'carol.tester@plantour.test', '+1-604-000-0003',
        'Ski weekend invite',
        'Carol, join us for skiing this winter.',
        '2025-01-11 09:00:00+00',
        '2025-02-11 23:59:59+00',
        NULL,
        NULL,
        '2025-01-11 09:10:00+00',
        (SELECT id FROM communication_types WHERE name = 'SMS'),
        'Invitation sent, awaiting response'
    ),
    -- Accepted phone invitation for Business conference
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Business conference Toronto'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'invite-token-toronto-dave',
        'INVTOR01',
        'Dave', 'Tester', 'dave.tester@plantour.test', '+1-604-000-0004',
        'Business conference in Toronto',
        'Dave, would you like to join the Toronto conference trip?',
        '2025-04-01 14:00:00+00',
        '2025-09-01 23:59:59+00',
        '2025-04-03 10:00:00+00',
        NULL,
        '2025-04-01 15:00:00+00',
        (SELECT id FROM communication_types WHERE name = 'phone'),
        'Accepted after phone call'
    ),
    -- Refused email invitation for Hiking Rockies
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hiking Rockies'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'invite-token-rockies-carol',
        'INVROK01',
        'Carol', 'Tester', 'carol.tester@plantour.test', '+1-604-000-0003',
        'Hiking trip in the Rockies',
        'Carol, join us for a hiking adventure in the Rockies.',
        '2025-05-01 12:00:00+00',
        '2026-06-01 23:59:59+00',
        NULL,
        '2025-05-05 09:00:00+00',
        '2025-05-01 12:15:00+00',
        (SELECT id FROM communication_types WHERE name = 'email'),
        'Refused, not interested in long hikes'
    ),
    -- Accepted Telegram invitation for Road trip
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Road trip USA west coast'),
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'invite-token-roadtrip-bob',
        'INVUSA01',
        'Bob', 'Participant', 'bob.participant@plantour.test', '+1-604-000-0002',
        'Road trip along the west coast',
        'Bob, road trip from Vancouver to San Diego, are you in?',
        '2025-06-01 08:00:00+00',
        '2026-08-01 23:59:59+00',
        '2025-06-02 10:00:00+00',
        NULL,
        '2025-06-01 08:05:00+00',
        (SELECT id FROM communication_types WHERE name = 'Telegram'),
        'Accepted, planning routes together'
    ),
    -- Pending in-person invitation for Photography tour
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Photography tour Europe'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'invite-token-europe-alice',
        'INVEUR01',
        'Alice', 'Participant', 'alice.participant@plantour.test', '+1-604-000-0001',
        'Photography tour across Europe',
        'Alice, I am planning a photography tour in Europe.',
        '2024-01-10 18:00:00+00',
        '2024-06-01 23:59:59+00',
        NULL,
        NULL,
        NULL,
        (SELECT id FROM communication_types WHERE name = 'in person'),
        'Discussed in person, no final decision yet'
    ),
    -- Accepted SMS invitation for Hawaii trip for Carol
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Hawaii family vacation'),
        (SELECT id FROM users WHERE email = 'admin@plantour.test'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'invite-token-hawaii-carol',
        'INVHWC01',
        'Carol', 'Tester', 'carol.tester@plantour.test', '+1-604-000-0003',
        'Extra seat for Hawaii trip',
        'Carol, we have one more seat for Hawaii, join us.',
        '2025-01-03 13:00:00+00',
        '2025-12-31 23:59:59+00',
        '2025-01-04 09:00:00+00',
        NULL,
        '2025-01-03 13:10:00+00',
        (SELECT id FROM communication_types WHERE name = 'SMS'),
        'Accepted quickly after SMS'
    ),
    -- Refused email invitation for Business conference
    (
        gen_random_uuid(),
        (SELECT id FROM trips WHERE short_description = 'Business conference Toronto'),
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        (SELECT id FROM users WHERE email = 'carol.tester@plantour.test'),
        'invite-token-toronto-carol',
        'INVTOR02',
        'Carol', 'Tester', 'carol.tester@plantour.test', '+1-604-000-0003',
        'Conference in Toronto',
        'Carol, do you want to join the Toronto conference?',
        '2025-03-01 11:00:00+00',
        '2025-09-01 23:59:59+00',
        NULL,
        '2025-03-05 08:00:00+00',
        '2025-03-01 11:05:00+00',
        (SELECT id FROM communication_types WHERE name = 'email'),
        'Refused due to other projects'
    );


-- ====================================================================
-- TRIP USER PACKAGES
-- Map some user_packages into trip_user_packages (approx. 20 rows)
-- ====================================================================
INSERT INTO trip_user_packages (
    id, trip_user_id, user_package_id, parent_package_id,
    packing_status_id, packed_at, label, packing_list_included,
    weight_value, weight_unit_id
)
SELECT
    gen_random_uuid(),
    tu.id,
    up.id,
    NULL,
    (SELECT id FROM packing_status WHERE name = 'Planning'),
    NULL,
    u.first_name || ' - ' || up.short_description,
    FALSE,
    NULL,
    NULL
FROM trip_users tu
JOIN users u ON u.id = tu.user_id
JOIN user_packages up ON up.user_id = u.id
WHERE up.short_description LIKE '%suitcase'
   OR up.short_description LIKE '%backpack'
LIMIT 20;


-- ====================================================================
-- TRIP USER THINGS
-- Map some user_things into trip_user_things (approx. 30 rows)
-- ====================================================================
INSERT INTO trip_user_things (
    id, trip_user_id, user_thing_id, trip_user_package_id,
    qty, packing_status_id, packed_at
)
SELECT
    gen_random_uuid(),
    tu.id,
    ut.id,
    NULL,
    1,
    (SELECT id FROM packing_status WHERE name = 'Planning'),
    NULL
FROM trip_users tu
JOIN users u ON u.id = tu.user_id
JOIN user_things ut ON ut.user_id = u.id
LIMIT 30;


COMMIT;
