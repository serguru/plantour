
set search_path to plantour, public;

begin;


-----------------------------------------------------------------------
-- TEST DATA FOR PLANTOUR (EXTENSION TO BASE SCHEMA)
-- This script assumes that the schema and base data from the original
-- script have already been created.
-----------------------------------------------------------------------

-- ====================================================================
-- REFRESH TOKENS
-- ====================================================================
INSERT INTO refresh_tokens (user_id, token, expires_at, created_at, revoked_at, replaced_by_token)
VALUES
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'admin-refresh-token-1',
        '2026-01-01T00:00:00Z',
        '2025-11-01T09:00:00Z',
        NULL,
        NULL
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'alice-refresh-token-1',
        '2025-12-31T00:00:00Z',
        '2025-10-01T10:00:00Z',
        '2025-11-15T12:00:00Z',
        NULL
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'bob-refresh-token-1',
        '2025-12-31T00:00:00Z',
        '2025-10-05T11:30:00Z',
        NULL,
        'bob-refresh-token-2'
    );


-- ====================================================================
-- USER THINGS (PER-USER CATALOGS)
-- ====================================================================
INSERT INTO user_things (user_id, category, name, units, value, notes)
VALUES
    -- Admin user things
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Documents',
        'Passport (Canada)',
        'pcs',
        1.000,
        'Always keep in carry-on'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Clothing',
        'Yellow checked suitcase clothes set',
        'pcs',
        1.000,
        'Main clothing set for long trips'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Electronics',
        'Laptop 14-inch with charger',
        'pcs',
        1.000,
        'Work laptop'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Electronics',
        'Camera body + 24-70mm lens',
        'pcs',
        1.000,
        'Mirrorless camera for trips'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Health & Hygiene',
        'Travel-size toiletries kit',
        'pcs',
        1.000,
        'Shampoo, soap, toothbrush, toothpaste, razor'
    ),

    -- Alice things
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Clothing',
        'Warm ski jacket',
        'pcs',
        1.000,
        'Waterproof ski jacket'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Footwear',
        'Ski boots pair',
        'pcs',
        1.000,
        'Boots in separate boot bag'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Clothing',
        'Thermal socks',
        'pcs',
        4.000,
        'Thick wool socks'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Accessories',
        'Ski goggles',
        'pcs',
        1.000,
        'Anti-fog lenses'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Health & Hygiene',
        'SPF 50 sunscreen',
        'ml',
        101.000,
        'For skiing in sunny weather'
    ),

    -- Bob things
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Electronics',
        'Travel laptop 13-inch',
        'pcs',
        1.000,
        'Lightweight ultrabook'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Electronics',
        'Noise-cancelling headphones',
        'pcs',
        1.000,
        'For flights and buses'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Clothing',
        'Casual t-shirts',
        'pcs',
        5.000,
        'Neutral colors'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Outdoor & Sports',
        'Compact trekking poles',
        'pcs',
        1.000,
        'Foldable'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Food & Snacks',
        'Energy bars assorted',
        'pcs',
        11.000,
        'Mixed flavors');


-- ====================================================================
-- USER PACKAGES (PER-USER MASTER PACKAGES)
-- ====================================================================
INSERT INTO user_packages (user_id, name, description)
VALUES
    -- Admin packages
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Yellow suitcase',
        'Large yellow hard-shell suitcase 90L'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Blue backpack',
        '30L travel backpack with laptop compartment'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Camera shoulder bag',
        'Small padded camera bag'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Toiletries pouch',
        'Small waterproof toiletries pouch'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Daypack',
        '20L lightweight daypack for hikes'
    ),

    -- Alice packages
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Red ski bag',
        'Long ski bag for skis and poles'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Boot bag',
        'Small ski boot bag'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Small backpack',
        '18L day backpack'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Cosmetics pouch',
        'Soft pouch for cosmetics'
    ),
    (
        (SELECT id FROM users WHERE email = 'alice.participant@plantour.test'),
        'Document organizer',
        'Slim organizer for documents and tickets'
    ),

    -- Bob packages
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Carry-on suitcase',
        '55cm cabin suitcase'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Electronics organizer',
        'Cable and gadget organizer'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Hiking backpack',
        '40L hiking backpack with frame'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Toiletry bag',
        'Hanging toiletry bag'
    ),
    (
        (SELECT id FROM users WHERE email = 'bob.participant@plantour.test'),
        'Snack box',
        'Plastic box for snacks'
    );


-- ====================================================================
-- TRIPS (5 ENTITIES WITH REALISTIC DATES)
-- ====================================================================
INSERT INTO trips (user_id, trip_status, name, description, start_date, end_date)
VALUES
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Planning',
        'Family Ski Trip to Whistler',
        'Five-day ski holiday in Whistler with family. Staying in a condo close to lifts.',
        '2026-01-10',
        '2026-01-15'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Completed',
        'Summer Camping at Garibaldi Lake',
        'Backpacking trip with overnight camping at Garibaldi Lake campground.',
        '2024-08-05',
        '2024-08-10'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Active',
        'Weekend in Seattle',
        'Short city break in Seattle with sightseeing and shopping.',
        '2025-12-05',
        '2025-12-07'
    ),
    (
        (SELECT id FROM users WHERE email = 'serguru@gmail.com'),
        'Archived',
        'Business Trip to Toronto',
        'Conference and client meetings in downtown Toronto.',
        '2023-03-10',
        '2023-03-13'
    ),
    (
        (SELECT id FROM users WHERE email = 'dave.tester@plantour.test'),
        'Planning',
        'Fishing Trip to Gulf Islands',
        'Boat-based fishing and island camping around the Southern Gulf Islands.',
        '2026-05-20',
        '2026-05-25'
    );


-- ====================================================================
-- INVITATIONS
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
    -- Ski trip invitations
    (
        (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler'),
        'INV-WHIS-ALICE-001',
        'Alice',
        'Participant',
        'alice.participant@plantour.test',
        '+1-604-000-0001',
        'Whistler ski trip invitation',
        'Hi Alice, would you like to join our family ski trip to Whistler in January?',
        '2025-11-01T09:00:00Z',
        '2025-12-15T09:00:00Z',
        '2025-11-05T18:30:00Z',
        NULL,
        '2025-11-01T09:05:00Z',
        'email',
        'Accepted within a few days'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler'),
        'INV-WHIS-BOB-001',
        'Bob',
        'Participant',
        'bob.participant@plantour.test',
        '+1-604-000-0002',
        'Whistler ski trip invitation',
        'Hi Bob, we are planning a ski trip to Whistler, are you in?',
        '2025-11-01T09:10:00Z',
        '2025-12-15T09:10:00Z',
        NULL,
        NULL,
        '2025-11-01T09:12:00Z',
        'WhatsApp',
        'Bob has not confirmed yet'
    ),

    -- Seattle weekend invitations
    (
        (SELECT id FROM trips WHERE name = 'Weekend in Seattle'),
        'INV-SEA-ALICE-001',
        'Alice',
        'Participant',
        'alice.participant@plantour.test',
        '+1-604-000-0001',
        'Weekend in Seattle invitation',
        'Hi Alice, spontaneous weekend trip to Seattle. Want to join?',
        '2025-11-25T08:00:00Z',
        '2025-12-03T08:00:00Z',
        '2025-11-26T14:00:00Z',
        NULL,
        '2025-11-25T08:05:00Z',
        'SMS',
        'Accepted quickly'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Weekend in Seattle'),
        'INV-SEA-FRIEND-001',
        'Charlie',
        'Friend',
        'charlie.friend@example.test',
        '+1-604-000-0100',
        'Weekend in Seattle invitation',
        'Hi Charlie, we are heading to Seattle this weekend, join us if you can.',
        '2025-11-25T08:10:00Z',
        '2025-12-03T08:10:00Z',
        NULL,
        '2025-11-28T20:00:00Z',
        '2025-11-25T08:12:00Z',
        'email',
        'Charlie refused due to work schedule'
    ),

    -- Fishing trip invitation
    (
        (SELECT id FROM trips WHERE name = 'Fishing Trip to Gulf Islands'),
        'INV-FISH-ALICE-001',
        'Alice',
        'Participant',
        'alice.participant@plantour.test',
        '+1-604-000-0001',
        'Gulf Islands fishing trip',
        'Hi Alice, planning a boat-based fishing trip around the Gulf Islands in May. Interested?',
        '2026-02-01T10:00:00Z',
        '2026-03-01T10:00:00Z',
        NULL,
        NULL,
        NULL,
        'email',
        'Invite created but not yet sent'
    );


-- ====================================================================
-- TRIP USERS (LINK TRIPS WITH ADMIN PARTICIPANTS)
-- ====================================================================
INSERT INTO trip_users (
    trip_id,
    admin_participant_id,
    participant_status,
    email,
    first_name,
    last_name,
    phone,
    notes
)
VALUES
    -- Whistler ski trip: Alice and Bob
    (
        (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler'),
        (
            SELECT id FROM admins_participants
            WHERE admin_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')
              AND email = 'alice.participant@plantour.test'
        ),
        'Active',
        'alice.participant@plantour.test',
        'Alice',
        'Participant',
        '+1-604-000-0001',
        'Alice confirmed Whistler ski trip'
    ),
    (
        (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler'),
        (
            SELECT id FROM admins_participants
            WHERE admin_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')
              AND email = 'bob.participant@plantour.test'
        ),
        'Invited',
        'bob.participant@plantour.test',
        'Bob',
        'Participant',
        '+1-604-000-0002',
        'Bob still deciding about Whistler trip'
    ),

    -- Seattle weekend: Alice only
    (
        (SELECT id FROM trips WHERE name = 'Weekend in Seattle'),
        (
            SELECT id FROM admins_participants
            WHERE admin_id = (SELECT id FROM users WHERE email = 'serguru@gmail.com')
              AND email = 'alice.participant@plantour.test'
        ),
        'Active',
        'alice.participant@plantour.test',
        'Alice',
        'Participant',
        '+1-604-000-0001',
        'Alice joined Seattle weekend trip'
    );


-- ====================================================================
-- TRIP USER PACKAGES (2-LEVEL NESTED STRUCTURE)
-- ====================================================================
-- Whistler trip packages for Alice and Bob
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
    -- Alice on Whistler trip: parent package - Yellow suitcase
    (
        NULL,
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'alice.participant@plantour.test'
        ),
        'Yellow suitcase',
        'Main luggage',
        'Large yellow hard-shell suitcase for clothing and gear',
        'Planning',
        NULL,
        true,
        1.000,
        'kg'
    ),
    -- Alice child package inside Yellow suitcase
    (
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
                  AND email = 'alice.participant@plantour.test'
            )
              AND name = 'Yellow suitcase'
        ),
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'alice.participant@plantour.test'
        ),
        'Shoe and boot bag',
        'Footwear',
        'Bag inside suitcase for ski boots and spare shoes',
        'Planning',
        NULL,
        true,
        1.000,
        'kg'
    ),
    -- Alice second parent package - Small backpack
    (
        NULL,
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'alice.participant@plantour.test'
        ),
        'Small backpack',
        'Daypack',
        'Daypack for ski resort and village walks',
        'Planning',
        NULL,
        true,
        1.000,
        'kg'
    ),

    -- Bob on Whistler trip: parent Blue backpack
    (
        NULL,
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'bob.participant@plantour.test'
        ),
        'Blue backpack',
        'Carry-on',
        'Backpack used as carry-on on the bus',
        'Planning',
        NULL,
        true,
        1.000,
        'kg'
    ),
    -- Bob child package - Electronics pouch
    (
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
                  AND email = 'bob.participant@plantour.test'
            )
              AND name = 'Blue backpack'
        ),
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'bob.participant@plantour.test'
        ),
        'Electronics pouch',
        'Electronics',
        'Inner pouch for laptop charger, cables and power bank',
        'Planning',
        NULL,
        true,
        1.000,
        'kg'
    ),

    -- Alice on Seattle weekend: parent Carry-on suitcase
    (
        NULL,
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend in Seattle')
              AND email = 'alice.participant@plantour.test'
        ),
        'Carry-on suitcase',
        'Cabin luggage',
        'Small cabin suitcase for 2-night city break',
        'Active',
        '2025-12-05T13:00:00Z',
        true,
        8.200,
        'kg'
    ),
    -- Alice child package - Toiletries pouch in carry-on
    (
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend in Seattle')
                  AND email = 'alice.participant@plantour.test'
            )
              AND name = 'Carry-on suitcase'
        ),
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend in Seattle')
              AND email = 'alice.participant@plantour.test'
        ),
        'Toiletries pouch',
        'Toiletries',
        'Small hanging toiletry bag',
        'Active',
        '2025-12-05T13:10:00Z',
        true,
        0.800,
        'kg'
    );


-- ====================================================================
-- TRIP USER THINGS (ITEMS IN NESTED PACKAGES)
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
    -- Alice Whistler: clothing in Yellow suitcase
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'alice.participant@plantour.test'
        ),
        'Clothing',
        'Warm ski jacket',
        'pcs',
        1.000,
        'Waterproof insulated jacket',
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
                  AND email = 'alice.participant@plantour.test'
            )
              AND name = 'Yellow suitcase'
        ),
        'Planning',
        NULL
    ),
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'alice.participant@plantour.test'
        ),
        'Clothing',
        'Thermal socks',
        'pcs',
        4.000,
        'Thick wool socks',
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
                  AND email = 'alice.participant@plantour.test'
            )
              AND name = 'Yellow suitcase'
        ),
        'Planning',
        NULL
    ),
    -- Alice Whistler: footwear in Shoe and boot bag (child package)
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'alice.participant@plantour.test'
        ),
        'Footwear',
        'Ski boots pair',
        'pcs',
        1.000,
        'In separate boot bag',
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
                  AND email = 'alice.participant@plantour.test'
            )
              AND name = 'Shoe and boot bag'
        ),
        'Planning',
        NULL
    ),
    -- Alice Whistler: accessories in Small backpack
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'alice.participant@plantour.test'
        ),
        'Accessories',
        'Ski goggles',
        'pcs',
        1.000,
        'With protective case',
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
                  AND email = 'alice.participant@plantour.test'
            )
              AND name = 'Small backpack'
        ),
        'Planning',
        NULL
    ),
    -- Bob Whistler: electronics in Electronics pouch (child package)
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'bob.participant@plantour.test'
        ),
        'Electronics',
        'Travel laptop 13-inch',
        'pcs',
        1.000,
        'Used for remote work in evenings',
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
                  AND email = 'bob.participant@plantour.test'
            )
              AND name = 'Electronics pouch'
        ),
        'Planning',
        NULL
    ),
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
              AND email = 'bob.participant@plantour.test'
        ),
        'Food & Snacks',
        'Energy bars assorted',
        'pcs',
        11.000,
        'Packed in top pocket of backpack',
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Family Ski Trip to Whistler')
                  AND email = 'bob.participant@plantour.test'
            )
              AND name = 'Blue backpack'
        ),
        'Planning',
        NULL
    ),

    -- Alice Seattle weekend: clothing and toiletries in nested packages
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend in Seattle')
              AND email = 'alice.participant@plantour.test'
        ),
        'Clothing',
        'Casual t-shirts',
        'pcs',
        3.000,
        'For city walks',
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend in Seattle')
                  AND email = 'alice.participant@plantour.test'
            )
              AND name = 'Carry-on suitcase'
        ),
        'Active',
        '2025-12-05T13:15:00Z'
    ),
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend in Seattle')
              AND email = 'alice.participant@plantour.test'
        ),
        'Health & Hygiene',
        'Travel-size toiletries kit',
        'pcs',
        1.000,
        'Basic kit for hotel stay',
        (
            SELECT id FROM trip_user_packages
            WHERE trip_user_id = (
                SELECT id FROM trip_users
                WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend in Seattle')
                  AND email = 'alice.participant@plantour.test'
            )
              AND name = 'Toiletries pouch'
        ),
        'Active',
        '2025-12-05T13:20:00Z'
    ),
    -- Alice Seattle weekend: document not assigned to any package yet
    (
        (
            SELECT id FROM trip_users
            WHERE trip_id = (SELECT id FROM trips WHERE name = 'Weekend in Seattle')
              AND email = 'alice.participant@plantour.test'
        ),
        'Documents',
        'Passport (Canada)',
        'pcs',
        1.000,
        'To be kept in personal handbag',
        NULL,
        'Planning',
        NULL
    );


commit;