SET search_path TO plantour, public;

begin;

DO $$
DECLARE
    -- Переменные для хранения ID
    v_act_id UUID;
    v_tmpl_id UUID;
    v_gen_m UUID := (SELECT id FROM genders WHERE name = 'Male');
    v_gen_f UUID := (SELECT id FROM genders WHERE name = 'Female');
    v_gen_u UUID := (SELECT id FROM genders WHERE name = 'Unisex');
BEGIN
    -----------------------------------------------------------------------
    -- 1. ACTIVITIES (20 штук)
    -----------------------------------------------------------------------
    INSERT INTO activities (name, notes) VALUES
    ('Skiing', 'Winter sports and mountain resorts'),
    ('Surfing', 'Wave riding in oceans and seas'),
    ('Hiking', 'Mountain and forest trekking'),
    ('Business Trip', 'Formal meetings and conferences'),
    ('Beach Leisure', 'Relaxing at the seaside'),
    ('Scuba Diving', 'Underwater exploration'),
    ('City Tour', 'Urban sightseeing and museums'),
    ('Camping', 'Outdoor living in tents'),
    ('Golfing', 'Professional or leisure golf'),
    ('Yoga Retreat', 'Spiritual and physical wellness'),
    ('Safari', 'Wildlife watching in national parks'),
    ('Cycling', 'Long distance or mountain biking'),
    ('Photography', 'Nature and architectural photography'),
    ('Nightlife', 'Clubbing and evening entertainment'),
    ('Fishing', 'Lakes, rivers or sea fishing'),
    ('Wine Tasting', 'Visiting vineyards and cellars'),
    ('Rock Climbing', 'Technical mountain climbing'),
    ('Sailing', 'Yachting and boat trips'),
    ('Desert Trekking', 'Expeditions in arid zones'),
    ('Canyoning', 'River trekking and rappelling')
    ON CONFLICT (name) DO NOTHING;

    -----------------------------------------------------------------------
    -- 2. TEMPLATES & THINGS (Примеры заполнения)
    -----------------------------------------------------------------------

    -- ACTIVITY: SKIING
    v_act_id := (SELECT id FROM activities WHERE name = 'Skiing');
    INSERT INTO thing_templates (name, activity_id, age_from, age_to, temperature_from, temperature_to, notes)
    VALUES ('Pro Alpine Skiing', v_act_id, 18, 60, -25, 5, 'Professional gear for cold mountains')
    RETURNING id INTO v_tmpl_id;

    INSERT INTO template_genders (template_id, gender_id) VALUES (v_tmpl_id, v_gen_u);
    INSERT INTO template_countries (template_id, country_id) 
    SELECT v_tmpl_id, id FROM countries WHERE name IN ('Austria', 'Switzerland', 'Canada', 'France', 'Norway');
    
    INSERT INTO template_things (template_id, category, name, units, value, notes) VALUES
    (v_tmpl_id, 'Gear', 'Alpine Skis', 'pair', 1, 'Waxed for cold snow'),
    (v_tmpl_id, 'Clothing', 'Thermal Base Layer', 'set', 2, 'Merino wool recommended'),
    (v_tmpl_id, 'Clothing', 'Ski Jacket (Gore-Tex)', 'pcs', 1, 'Windproof'),
    (v_tmpl_id, 'Safety', 'Ski Helmet', 'pcs', 1, 'Standard safety'),
    (v_tmpl_id, 'Health', 'High Altitude Sunscreen', 'pcs', 1, 'SPF 50+');

    -- ACTIVITY: SURFING
    v_act_id := (SELECT id FROM activities WHERE name = 'Surfing');
    INSERT INTO thing_templates (name, activity_id, age_from, age_to, temperature_from, temperature_to, notes)
    VALUES ('Ocean Summer Surfing', v_act_id, 12, 50, 20, 35, 'Warm water surfing kit')
    RETURNING id INTO v_tmpl_id;

    INSERT INTO template_genders (template_id, gender_id) VALUES (v_tmpl_id, v_gen_u);
    INSERT INTO template_countries (template_id, country_id) 
    SELECT v_tmpl_id, id FROM countries WHERE name IN ('Australia', 'Indonesia', 'Portugal', 'Brazil', 'Sri Lanka');

    INSERT INTO template_things (template_id, category, name, units, value, notes) VALUES
    (v_tmpl_id, 'Gear', 'Surfboard', 'pcs', 1, 'Shortboard or Longboard'),
    (v_tmpl_id, 'Clothing', 'Rash Guard', 'pcs', 2, 'UV protection'),
    (v_tmpl_id, 'Accessory', 'Leash', 'pcs', 1, 'Essential safety'),
    (v_tmpl_id, 'Health', 'Zinc Paste (Face)', 'pcs', 1, 'Maximum sun block'),
    (v_tmpl_id, 'Clothing', 'Boardshorts', 'pcs', 2, 'Quick dry');

    -- ACTIVITY: BUSINESS TRIP
    v_act_id := (SELECT id FROM activities WHERE name = 'Business Trip');
    INSERT INTO thing_templates (name, activity_id, age_from, temperature_from, temperature_to, notes)
    VALUES ('Corporate Executive Male', v_act_id, 25, 5, 30, 'Formal attire for business capitals')
    RETURNING id INTO v_tmpl_id;

    INSERT INTO template_genders (template_id, gender_id) VALUES (v_tmpl_id, v_gen_m);
    INSERT INTO template_countries (template_id, country_id) 
    SELECT v_tmpl_id, id FROM countries WHERE name IN ('Germany', 'Singapore', 'United States of America', 'Japan', 'United Kingdom');

    INSERT INTO template_things (template_id, category, name, units, value, notes) VALUES
    (v_tmpl_id, 'Clothing', 'Business Suit', 'set', 2, 'Dark colors'),
    (v_tmpl_id, 'Electronics', 'Laptop & Charger', 'pcs', 1, 'Work essential'),
    (v_tmpl_id, 'Accessory', 'Tie', 'pcs', 3, 'Silk'),
    (v_tmpl_id, 'Hygiene', 'Shaving Kit', 'set', 1, 'Travel size'),
    (v_tmpl_id, 'Document', 'Business Cards', 'pcs', 50, 'English/Local language');

    -- ACTIVITY: SAFARI
    v_act_id := (SELECT id FROM activities WHERE name = 'Safari');
    INSERT INTO thing_templates (name, activity_id, age_from, age_to, temperature_from, temperature_to, notes)
    VALUES ('African Savannah Explorer', v_act_id, 10, 75, 15, 40, 'Neutral colors for wildlife watching')
    RETURNING id INTO v_tmpl_id;

    INSERT INTO template_genders (template_id, gender_id) VALUES (v_tmpl_id, v_gen_u);
    INSERT INTO template_countries (template_id, country_id) 
    SELECT v_tmpl_id, id FROM countries WHERE name IN ('Kenya', 'Tanzania', 'South Africa', 'Botswana', 'Namibia');

    INSERT INTO template_things (template_id, category, name, units, value, notes) VALUES
    (v_tmpl_id, 'Optics', 'Binoculars', 'pcs', 1, '8x42 recommended'),
    (v_tmpl_id, 'Clothing', 'Safari Hat', 'pcs', 1, 'Wide brim'),
    (v_tmpl_id, 'Health', 'Insect Repellent (DEET)', 'pcs', 1, 'Anti-mosquito'),
    (v_tmpl_id, 'Clothing', 'Khaki Trousers', 'pcs', 2, 'No bright colors'),
    (v_tmpl_id, 'Health', 'Antimalarial Pills', 'pcs', 1, 'Consult doctor first');

    -- ACTIVITY: HIKING
    v_act_id := (SELECT id FROM activities WHERE name = 'Hiking');
    INSERT INTO thing_templates (name, activity_id, age_from, temperature_from, temperature_to, notes)
    VALUES ('Mountain Trekking Junior', v_act_id, 7, -5, 20, 'Light hiking for children/teens')
    RETURNING id INTO v_tmpl_id;

    INSERT INTO template_genders (template_id, gender_id) VALUES (v_tmpl_id, v_gen_u);
    INSERT INTO template_countries (template_id, country_id) 
    SELECT v_tmpl_id, id FROM countries WHERE name IN ('Nepal', 'Georgia', 'Peru', 'New Zealand', 'Chile');

    INSERT INTO template_things (template_id, category, name, units, value, notes) VALUES
    (v_tmpl_id, 'Footwear', 'Hiking Boots', 'pair', 1, 'Ankle support'),
    (v_tmpl_id, 'Gear', 'Backpack 30L', 'pcs', 1, 'Rain cover included'),
    (v_tmpl_id, 'Utility', 'Water Bladder', 'pcs', 1, '2 Liters'),
    (v_tmpl_id, 'Safety', 'First Aid Kit', 'set', 1, 'Emergency supplies'),
    (v_tmpl_id, 'Clothing', 'Fleece Jacket', 'pcs', 1, 'Warm layer');

    -- ACTIVITY: DESERT TREKKING
    v_act_id := (SELECT id FROM activities WHERE name = 'Desert Trekking');
    INSERT INTO thing_templates (name, activity_id, age_from, age_to, temperature_from, temperature_to)
    VALUES ('Sahara Expedition', v_act_id, 18, 65, 10, 45)
    RETURNING id INTO v_tmpl_id;

    INSERT INTO template_countries (template_id, country_id) 
    SELECT v_tmpl_id, id FROM countries WHERE name IN ('Algeria', 'Egypt', 'Morocco', 'Jordan', 'United Arab Emirates');

    INSERT INTO template_things (template_id, category, name, units, value, notes) VALUES
    (v_tmpl_id, 'Clothing', 'Shemagh (Headscarf)', 'pcs', 1, 'Protection from sand/sun'),
    (v_tmpl_id, 'Optics', 'Polarized Sunglasses', 'pcs', 1, 'Cat 4 protection'),
    (v_tmpl_id, 'Health', 'Electrolytes Powder', 'packs', 10, 'Prevent dehydration'),
    (v_tmpl_id, 'Gear', 'Sand-proof Gaiters', 'pair', 1, 'Keep sand out of shoes'),
    (v_tmpl_id, 'Utility', 'Solar Power Bank', 'pcs', 1, 'High capacity');

END $$;

commit;