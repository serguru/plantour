-- =====================================================================
-- PLANTOUR TEST DATA POPULATION SCRIPT
-- =====================================================================
-- This script creates test data for the plantour database:
-- - 1 Admin user (with password)
-- - 2 Participant users (without password, with access codes)
-- - Sample trips, packages, things, and related data
-- =====================================================================

set search_path to plantour, public;

-- Start transaction
BEGIN;

-- =====================================================================
-- USERS
-- =====================================================================
-- Admin user with password "Binary_09"
-- Participants don't have passwords, only access codes

DO $$
DECLARE
    admin_user_id uuid := 'a1111111-1111-1111-1111-111111111111';
    participant1_id uuid := 'a2222222-2222-2222-2222-222222222222';
    participant2_id uuid := 'a3333333-3333-3333-3333-333333333333';
    
    -- Unit IDs (will be fetched from DB)
    unit_kg_id uuid;
    unit_lb_id uuid;
    unit_g_id uuid;
    unit_l_id uuid;
    unit_ml_id uuid;
    unit_cm_id uuid;
    unit_m_id uuid;
    unit_in_id uuid;
    
    -- Category IDs
    cat_suitcase_id uuid;
    cat_backpack_id uuid;
    cat_bag_id uuid;
    
    -- Currency IDs
    curr_usd_id uuid;
    curr_eur_id uuid;
    
    -- Trip status IDs
    status_planning_id uuid;
    status_active_id uuid;
    status_completed_id uuid;
    
    -- Packing status IDs
    packing_planning_id uuid;
    packing_active_id uuid;
    packing_completed_id uuid;
    
    -- Trip IDs
    trip1_id uuid := 'b1111111-1111-1111-1111-111111111111';
    trip2_id uuid := 'b2222222-2222-2222-2222-222222222222';
    
    -- Trip user IDs
    trip_user_admin_trip1 uuid := 'c1111111-1111-1111-1111-111111111111';
    trip_user_p1_trip1 uuid := 'c2222222-2222-2222-2222-222222222222';
    trip_user_p2_trip1 uuid := 'c3333333-3333-3333-3333-333333333333';
    trip_user_admin_trip2 uuid := 'c4444444-4444-4444-4444-444444444444';
    
    -- Package IDs
    pkg_admin_1 uuid := 'd1111111-1111-1111-1111-111111111111';
    pkg_admin_2 uuid := 'd2222222-2222-2222-2222-222222222222';
    pkg_p1_1 uuid := 'd3333333-3333-3333-3333-333333333333';
    pkg_p2_1 uuid := 'd4444444-4444-4444-4444-444444444444';
    
    -- Thing IDs
    thing_admin_1 uuid := 'e1111111-1111-1111-1111-111111111111';
    thing_admin_2 uuid := 'e2222222-2222-2222-2222-222222222222';
    thing_admin_3 uuid := 'e3333333-3333-3333-3333-333333333333';
    thing_p1_1 uuid := 'e4444444-4444-4444-4444-444444444444';
    thing_p1_2 uuid := 'e5555555-5555-5555-5555-555555555555';
    thing_p2_1 uuid := 'e6666666-6666-6666-6666-666666666666';
    
BEGIN
    -- ================================================================
    -- FETCH UNIT IDs
    -- ================================================================
    SELECT id INTO unit_kg_id FROM units WHERE abbreviation = 'kg';
    SELECT id INTO unit_lb_id FROM units WHERE abbreviation = 'lb';
    SELECT id INTO unit_g_id FROM units WHERE abbreviation = 'g';
    SELECT id INTO unit_l_id FROM units WHERE abbreviation = 'L';
    SELECT id INTO unit_ml_id FROM units WHERE abbreviation = 'ml';
    SELECT id INTO unit_cm_id FROM units WHERE abbreviation = 'cm';
    SELECT id INTO unit_m_id FROM units WHERE abbreviation = 'm';
    SELECT id INTO unit_in_id FROM units WHERE abbreviation = 'in';
    
    -- ================================================================
    -- FETCH CATEGORY IDs
    -- ================================================================
    SELECT id INTO cat_suitcase_id FROM package_categories WHERE name = 'Suitcase';
    SELECT id INTO cat_backpack_id FROM package_categories WHERE name = 'Backpack';
    SELECT id INTO cat_bag_id FROM package_categories WHERE name = 'Bag';
    
    -- ================================================================
    -- FETCH CURRENCY IDs
    -- ================================================================
    SELECT id INTO curr_usd_id FROM currencies WHERE name = 'USD';
    SELECT id INTO curr_eur_id FROM currencies WHERE name = 'EUR';
    
    -- ================================================================
    -- FETCH STATUS IDs
    -- ================================================================
    SELECT id INTO status_planning_id FROM trip_status WHERE name = 'Planning';
    SELECT id INTO status_active_id FROM trip_status WHERE name = 'Active';
    SELECT id INTO status_completed_id FROM trip_status WHERE name = 'Completed';
    
    SELECT id INTO packing_planning_id FROM packing_status WHERE name = 'Planning';
    SELECT id INTO packing_active_id FROM packing_status WHERE name = 'Active';
    SELECT id INTO packing_completed_id FROM packing_status WHERE name = 'Completed';
    
    -- ================================================================
    -- INSERT USERS
    -- ================================================================
    
    -- Admin user with password "Binary_09"
    INSERT INTO users (id, email, password_hash, password_salt, first_name, last_name, phone, notes)
    VALUES (
        admin_user_id,
        'admin@plantour.com',
        '\x35c846498f41a7ed1513b765c264ab222f7c3b015163fc07c78f6af00554436d2bb8f3d105a848584a0103f228132affc301505136188d50194e14f9a32d0f64',
        '\x727465da121430b0bf747ea4a4cc3c21f458c61b824b15d354fc8e10adb5d2a7e82a3aa26363d48178341995f078275e2d5b3c5df70536c6af73a6dff32e15b7',
        'John',
        'Administrator',
        '+1-555-0100',
        'Main admin user for testing'
    );
    
    -- Participant 1 (no password)
    INSERT INTO users (id, email, password_hash, password_salt, first_name, last_name, phone, notes)
    VALUES (
        participant1_id,
        'alice.participant@example.com',
        NULL,
        NULL,
        'Alice',
        'Smith',
        '+1-555-0201',
        'First participant user for testing'
    );
    
    -- Participant 2 (no password)
    INSERT INTO users (id, email, password_hash, password_salt, first_name, last_name, phone, notes)
    VALUES (
        participant2_id,
        'bob.participant@example.com',
        NULL,
        NULL,
        'Bob',
        'Johnson',
        '+1-555-0202',
        'Second participant user for testing'
    );
    
    -- ================================================================
    -- ADMINS_PARTICIPANTS RELATIONSHIP
    -- ================================================================
    
    -- Link participants to admin with access codes
    INSERT INTO admins_participants (admin_id, participant_id, access_code)
    VALUES 
        (admin_user_id, participant1_id, 'VO1TS0K2'),
        (admin_user_id, participant2_id, 'X584ML48');
    
    -- ================================================================
    -- USER PACKAGES
    -- ================================================================
    
    -- Admin's packages
    INSERT INTO user_packages (id, user_id, category_id, short_description, description, brand, model, color, 
                               empty_weight_value, weight_unit_id, length_value, width_value, height_value, dimension_unit_id, 
                               capacity_value, capacity_unit_id)
    VALUES 
        (pkg_admin_1, admin_user_id, cat_suitcase_id, 'Large Travel Suitcase', 'Red hard-shell suitcase for long trips', 
         'Samsonite', 'Omni PC', 'Red', 4.5, unit_kg_id, 75, 50, 30, unit_cm_id, 85, unit_l_id),
        
        (pkg_admin_2, admin_user_id, cat_backpack_id, 'Day Backpack', 'Small backpack for daily excursions', 
         'Osprey', 'Daylite', 'Blue', 0.45, unit_kg_id, 45, 28, 20, unit_cm_id, 13, unit_l_id);
    
    -- Participant 1's package
    INSERT INTO user_packages (id, user_id, category_id, short_description, description, brand, color, 
                               empty_weight_value, weight_unit_id, length_value, width_value, height_value, dimension_unit_id)
    VALUES 
        (pkg_p1_1, participant1_id, cat_backpack_id, 'Travel Backpack', 'Medium-sized travel backpack', 
         'North Face', 'Black', 1.2, unit_kg_id, 55, 35, 25, unit_cm_id);
    
    -- Participant 2's package
    INSERT INTO user_packages (id, user_id, category_id, short_description, description, color, 
                               empty_weight_value, weight_unit_id, length_value, width_value, height_value, dimension_unit_id)
    VALUES 
        (pkg_p2_1, participant2_id, cat_bag_id, 'Duffel Bag', 'Large sports duffel bag', 
         'Green', 0.8, unit_kg_id, 60, 30, 30, unit_cm_id);
    
    -- ================================================================
    -- USER THINGS
    -- ================================================================
    
    -- Admin's things
    INSERT INTO user_things (id, user_id, short_description, description, brand, model, color,
                            weight_value, weight_unit_id, purchase_date, purchase_price, purchase_currency_id)
    VALUES 
        (thing_admin_1, admin_user_id, 'Laptop', 'MacBook Pro 16-inch for work', 'Apple', 'MacBook Pro 16"', 'Space Gray',
         2.1, unit_kg_id, '2023-03-15', 2499.00, curr_usd_id),
        
        (thing_admin_2, admin_user_id, 'Camera', 'DSLR camera for travel photography', 'Canon', 'EOS R6', 'Black',
         0.68, unit_kg_id, '2022-11-20', 2299.00, curr_usd_id),
        
        (thing_admin_3, admin_user_id, 'Travel Adapter', 'Universal travel power adapter', 'Anker', 'PowerPort', 'White',
         0.15, unit_kg_id, '2024-01-10', 29.99, curr_usd_id);
    
    -- Participant 1's things
    INSERT INTO user_things (id, user_id, short_description, description, brand, color,
                            weight_value, weight_unit_id, purchase_date, purchase_price, purchase_currency_id)
    VALUES 
        (thing_p1_1, participant1_id, 'Hiking Boots', 'Waterproof hiking boots', 'Merrell', 'Brown',
         1.2, unit_kg_id, '2023-06-01', 150.00, curr_usd_id),
        
        (thing_p1_2, participant1_id, 'Water Bottle', 'Insulated stainless steel water bottle', 'Hydro Flask', 'Blue',
         0.35, unit_kg_id, '2023-08-15', 39.99, curr_usd_id);
    
    -- Participant 2's thing
    INSERT INTO user_things (id, user_id, short_description, description, brand, color,
                            weight_value, weight_unit_id)
    VALUES 
        (thing_p2_1, participant2_id, 'Sunglasses', 'Polarized sports sunglasses', 'Ray-Ban', 'Black',
         0.03, unit_kg_id);
    
    -- ================================================================
    -- TRIPS
    -- ================================================================
    
    -- Trip 1: Family vacation (Active)
    INSERT INTO trips (id, owner_id, trip_status_id, short_description, description, start_date, end_date, require_weight)
    VALUES 
        (trip1_id, admin_user_id, status_active_id, 'Summer Family Vacation 2025', 
         'Two-week family trip to Europe visiting Paris, Rome, and Barcelona', 
         '2025-07-01', '2025-07-14', true);
    
    -- Trip 2: Weekend getaway (Planning)
    INSERT INTO trips (id, owner_id, trip_status_id, short_description, description, start_date, end_date, require_weight)
    VALUES 
        (trip2_id, admin_user_id, status_planning_id, 'Mountain Hiking Weekend', 
         'Weekend hiking trip to the mountains with friends', 
         '2025-09-15', '2025-09-17', false);
    
    -- ================================================================
    -- TRIP USERS
    -- ================================================================
    
    -- Trip 1 participants
    INSERT INTO trip_users (id, trip_id, user_id, access_code)
    VALUES 
        (trip_user_admin_trip1, trip1_id, admin_user_id, 'ADMIN001'),
        (trip_user_p1_trip1, trip1_id, participant1_id, 'ALICE001'),
        (trip_user_p2_trip1, trip1_id, participant2_id, 'BOB00001');
    
    -- Trip 2 participants (only admin so far)
    INSERT INTO trip_users (id, trip_id, user_id, access_code)
    VALUES 
        (trip_user_admin_trip2, trip2_id, admin_user_id, 'ADMIN002');
    
    -- ================================================================
    -- TRIP USER PACKAGES
    -- ================================================================
    
    -- Admin's packages for Trip 1
    INSERT INTO trip_user_packages (trip_user_id, user_package_id, packing_status_id, label, packing_list_included)
    VALUES 
        (trip_user_admin_trip1, pkg_admin_1, packing_active_id, 'Main Luggage', true),
        (trip_user_admin_trip1, pkg_admin_2, packing_completed_id, 'Day Pack', true);
    
    -- Participant 1's package for Trip 1
    INSERT INTO trip_user_packages (trip_user_id, user_package_id, packing_status_id, label, packing_list_included)
    VALUES 
        (trip_user_p1_trip1, pkg_p1_1, packing_active_id, 'Alice Main Bag', true);
    
    -- Participant 2's package for Trip 1
    INSERT INTO trip_user_packages (trip_user_id, user_package_id, packing_status_id, label, packing_list_included)
    VALUES 
        (trip_user_p2_trip1, pkg_p2_1, packing_planning_id, 'Bob Duffel', true);
    
    -- ================================================================
    -- TRIP USER THINGS
    -- ================================================================
    
    -- Admin's things for Trip 1
    INSERT INTO trip_user_things (trip_user_id, user_thing_id, qty, packing_status_id)
    VALUES 
        (trip_user_admin_trip1, thing_admin_1, 1, packing_completed_id),
        (trip_user_admin_trip1, thing_admin_2, 1, packing_completed_id),
        (trip_user_admin_trip1, thing_admin_3, 1, packing_active_id);
    
    -- Participant 1's things for Trip 1
    INSERT INTO trip_user_things (trip_user_id, user_thing_id, qty, packing_status_id)
    VALUES 
        (trip_user_p1_trip1, thing_p1_1, 1, packing_active_id),
        (trip_user_p1_trip1, thing_p1_2, 2, packing_planning_id);
    
    -- Participant 2's thing for Trip 1
    INSERT INTO trip_user_things (trip_user_id, user_thing_id, qty, packing_status_id)
    VALUES 
        (trip_user_p2_trip1, thing_p2_1, 1, packing_planning_id);
    
    RAISE NOTICE 'Test data populated successfully!';
    RAISE NOTICE 'Admin user: admin@plantour.com (password: Binary_09)';
    RAISE NOTICE 'Participant 1: alice.participant@example.com (access code: VO1TS0K2)';
    RAISE NOTICE 'Participant 2: bob.participant@example.com (access code: X584ML48)';
    
END $$;

-- Commit transaction
COMMIT;

-- =====================================================================
-- VERIFICATION QUERIES (commented out - uncomment to verify data)
-- =====================================================================

-- SELECT 'Users' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'Admins-Participants', COUNT(*) FROM admins_participants
-- UNION ALL
-- SELECT 'User Packages', COUNT(*) FROM user_packages
-- UNION ALL
-- SELECT 'User Things', COUNT(*) FROM user_things
-- UNION ALL
-- SELECT 'Trips', COUNT(*) FROM trips
-- UNION ALL
-- SELECT 'Trip Users', COUNT(*) FROM trip_users
-- UNION ALL
-- SELECT 'Trip User Packages', COUNT(*) FROM trip_user_packages
-- UNION ALL
-- SELECT 'Trip User Things', COUNT(*) FROM trip_user_things;

-- =====================================================================
-- END OF SCRIPT
-- =====================================================================
