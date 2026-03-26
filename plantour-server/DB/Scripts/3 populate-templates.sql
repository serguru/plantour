SET search_path TO plantour_v2, public;

begin;


-----------------------------------------------------------------------
-- ACTIVITIES
-----------------------------------------------------------------------
INSERT INTO activities (name, notes) VALUES
('Beach Resort', 'Relaxing beach vacation with swimming, sunbathing, and water activities'),
('City Tourism', 'Urban exploration, museums, restaurants, and cultural sites'),
('Hiking & Trekking', 'Mountain trails, nature walks, and outdoor adventures'),
('Business Trip', 'Professional travel for meetings, conferences, and work'),
('Ski Resort', 'Winter sports including skiing, snowboarding, and alpine activities'),
('Safari & Wildlife', 'Wildlife observation, nature photography, and outdoor camping'),
('Cruise', 'Ocean or river cruise with onboard activities and port visits'),
('Backpacking', 'Budget travel with minimal luggage and hostel stays'),
('Road Trip', 'Car travel with flexible itinerary and multiple destinations'),
('Camping', 'Outdoor camping with tents and nature activities');

-----------------------------------------------------------------------
-- THING TEMPLATES - Beach Resort
-----------------------------------------------------------------------
-- Beach Resort + Extreme Heat + Early Adulthood
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Beach Resort - Extreme Heat - Early Adulthood', a.id, tr.id, ar.id, 'Beach essentials for hot weather young adults'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Beach Resort' AND tr.name = 'Extreme Heat' AND ar.name = 'Early Adulthood';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Clothing', 'Swimsuit', 'pieces', 2, 'Quick-dry swimwear'),
    ('Clothing', 'Beach cover-up', 'pieces', 2, 'Lightweight and breathable'),
    ('Clothing', 'Tank tops', 'pieces', 4, 'Cotton or moisture-wicking'),
    ('Clothing', 'Shorts', 'pieces', 3, 'Comfortable casual shorts'),
    ('Clothing', 'Sundress', 'pieces', 2, 'Light summer dresses'),
    ('Clothing', 'Flip-flops', 'pairs', 1, 'Beach footwear'),
    ('Clothing', 'Sandals', 'pairs', 1, 'Walking sandals'),
    ('Clothing', 'Sun hat', 'pieces', 1, 'Wide-brimmed for sun protection'),
    ('Clothing', 'Sunglasses', 'pieces', 1, 'UV protection'),
    ('Toiletries', 'Sunscreen SPF 50+', 'bottles', 1, 'Water-resistant, reef-safe'),
    ('Toiletries', 'After-sun lotion', 'bottles', 1, 'Aloe vera based'),
    ('Toiletries', 'Insect repellent', 'bottles', 1, 'Tropical formula'),
    ('Accessories', 'Beach bag', 'pieces', 1, 'Waterproof or sand-proof'),
    ('Accessories', 'Waterproof phone case', 'pieces', 1, 'For water activities'),
    ('Accessories', 'Beach towel', 'pieces', 2, 'Quick-dry microfiber'),
    ('Electronics', 'Portable charger', 'pieces', 1, 'Waterproof if possible'),
    ('Health', 'Reusable water bottle', 'pieces', 1, 'Stay hydrated in heat')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Beach Resort - Extreme Heat - Early Adulthood';

-----------------------------------------------------------------------
-- THING TEMPLATES - City Tourism
-----------------------------------------------------------------------
-- City Tourism + Mild + Prime Youth
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'City Tourism - Mild - Prime Youth', a.id, tr.id, ar.id, 'Urban exploration in moderate weather'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'City Tourism' AND tr.name = 'Mild' AND ar.name = 'Prime Youth';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Clothing', 'Jeans', 'pieces', 2, 'Comfortable for walking'),
    ('Clothing', 'Long-sleeve shirts', 'pieces', 3, 'Layering options'),
    ('Clothing', 'T-shirts', 'pieces', 3, 'Casual day wear'),
    ('Clothing', 'Light jacket', 'pieces', 1, 'For evening or indoor AC'),
    ('Clothing', 'Walking shoes', 'pairs', 1, 'Comfortable, broken-in'),
    ('Clothing', 'Casual dress shoes', 'pairs', 1, 'For restaurants'),
    ('Accessories', 'Backpack', 'pieces', 1, 'Day pack for sightseeing'),
    ('Accessories', 'Crossbody bag', 'pieces', 1, 'Anti-theft preferred'),
    ('Electronics', 'Phone and charger', 'sets', 1, 'With adapter if needed'),
    ('Electronics', 'Camera', 'pieces', 1, 'For memories'),
    ('Electronics', 'Power adapter', 'pieces', 1, 'Check local voltage'),
    ('Documents', 'City map or guidebook', 'pieces', 1, 'Offline access'),
    ('Documents', 'Museum passes', 'pieces', 1, 'Pre-booked if possible'),
    ('Accessories', 'Compact umbrella', 'pieces', 1, 'Folding type'),
    ('Accessories', 'Reusable shopping bag', 'pieces', 1, 'For purchases'),
    ('Health', 'Walking blister pads', 'packs', 1, 'Prevent foot issues')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'City Tourism - Mild - Prime Youth';

-----------------------------------------------------------------------
-- THING TEMPLATES - Hiking & Trekking
-----------------------------------------------------------------------
-- Hiking + Cool + Middle Youth
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Hiking & Trekking - Cool - Middle Youth', a.id, tr.id, ar.id, 'Mountain hiking in cool conditions'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Hiking & Trekking' AND tr.name = 'Cool' AND ar.name = 'Middle Youth';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Clothing', 'Hiking boots', 'pairs', 1, 'Waterproof, ankle support'),
    ('Clothing', 'Moisture-wicking base layers', 'pieces', 2, 'Long sleeve'),
    ('Clothing', 'Fleece jacket', 'pieces', 1, 'Mid-layer warmth'),
    ('Clothing', 'Waterproof shell jacket', 'pieces', 1, 'Wind and rain protection'),
    ('Clothing', 'Hiking pants', 'pieces', 2, 'Quick-dry, convertible'),
    ('Clothing', 'Hiking socks', 'pairs', 3, 'Wool or synthetic blend'),
    ('Clothing', 'Hat with brim', 'pieces', 1, 'Sun and rain protection'),
    ('Clothing', 'Lightweight gloves', 'pairs', 1, 'Fleece material'),
    ('Gear', 'Hiking backpack', 'pieces', 1, '25-35L capacity'),
    ('Gear', 'Trekking poles', 'pairs', 1, 'Adjustable'),
    ('Gear', 'Water bottles', 'pieces', 2, 'Or hydration system'),
    ('Gear', 'Headlamp', 'pieces', 1, 'With extra batteries'),
    ('Health', 'First aid kit', 'kits', 1, 'Trail-specific supplies'),
    ('Health', 'Trail sunscreen', 'bottles', 1, 'High SPF for altitude'),
    ('Health', 'Blister treatment', 'packs', 1, 'Moleskin or similar'),
    ('Food', 'Trail snacks', 'portions', 5, 'Energy bars, nuts'),
    ('Navigation', 'Trail map', 'pieces', 1, 'Physical backup'),
    ('Navigation', 'Compass', 'pieces', 1, 'Know how to use it')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Hiking & Trekking - Cool - Middle Youth';

-----------------------------------------------------------------------
-- THING TEMPLATES - Business Trip
-----------------------------------------------------------------------
-- Business Trip + Warm + Prime Youth
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Business Trip - Warm - Prime Youth', a.id, tr.id, ar.id, 'Professional travel in warm climate'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Business Trip' AND tr.name = 'Warm' AND ar.name = 'Prime Youth';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Clothing', 'Business suits', 'pieces', 2, 'Lightweight fabric'),
    ('Clothing', 'Dress shirts', 'pieces', 4, 'Wrinkle-resistant preferred'),
    ('Clothing', 'Dress pants', 'pieces', 3, 'Breathable material'),
    ('Clothing', 'Ties', 'pieces', 3, 'Professional styles'),
    ('Clothing', 'Dress shoes', 'pairs', 2, 'Comfortable for walking'),
    ('Clothing', 'Business casual outfit', 'sets', 1, 'For less formal occasions'),
    ('Clothing', 'Belt', 'pieces', 1, 'Matches shoes'),
    ('Electronics', 'Laptop and charger', 'sets', 1, 'Work essentials'),
    ('Electronics', 'Phone with charger', 'sets', 1, 'International adapter'),
    ('Electronics', 'Power bank', 'pieces', 1, 'For long days'),
    ('Documents', 'Business cards', 'boxes', 1, 'Networking essential'),
    ('Documents', 'Notebook and pen', 'sets', 1, 'Meeting notes'),
    ('Documents', 'Presentation materials', 'sets', 1, 'On USB backup'),
    ('Accessories', 'Professional bag', 'pieces', 1, 'Briefcase or laptop bag'),
    ('Accessories', 'Travel steamer', 'pieces', 1, 'Portable garment care'),
    ('Toiletries', 'Professional grooming kit', 'kits', 1, 'Looking sharp')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Business Trip - Warm - Prime Youth';

-----------------------------------------------------------------------
-- THING TEMPLATES - Ski Resort
-----------------------------------------------------------------------
-- Ski Resort + Extreme Cold + Early Adulthood
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Ski Resort - Extreme Cold - Early Adulthood', a.id, tr.id, ar.id, 'Winter sports in extreme cold'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Ski Resort' AND tr.name = 'Extreme Cold' AND ar.name = 'Early Adulthood';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Ski Gear', 'Ski jacket', 'pieces', 1, 'Insulated, waterproof'),
    ('Ski Gear', 'Ski pants', 'pieces', 1, 'Insulated, waterproof'),
    ('Ski Gear', 'Ski goggles', 'pieces', 1, 'Multiple lens options'),
    ('Ski Gear', 'Ski gloves', 'pairs', 2, 'Waterproof, insulated'),
    ('Ski Gear', 'Ski helmet', 'pieces', 1, 'Safety first'),
    ('Clothing', 'Thermal base layers', 'sets', 3, 'Top and bottom'),
    ('Clothing', 'Mid-layer fleece', 'pieces', 2, 'Additional warmth'),
    ('Clothing', 'Ski socks', 'pairs', 4, 'Tall, cushioned'),
    ('Clothing', 'Neck gaiter', 'pieces', 1, 'Face protection'),
    ('Clothing', 'Warm beanie', 'pieces', 1, 'Fits under helmet'),
    ('Clothing', 'Down jacket', 'pieces', 1, 'For après-ski'),
    ('Clothing', 'Insulated snow boots', 'pairs', 1, 'Waterproof'),
    ('Accessories', 'Hand warmers', 'packs', 5, 'Disposable heat packs'),
    ('Accessories', 'Lip balm with SPF', 'tubes', 1, 'Mountain sun protection'),
    ('Accessories', 'Mountain sunscreen SPF 50+', 'bottles', 1, 'Snow reflection'),
    ('Health', 'Cold weather first aid kit', 'kits', 1, 'Cold-weather specific'),
    ('Gear', 'Slope backpack', 'pieces', 1, 'For day trips on slopes')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Ski Resort - Extreme Cold - Early Adulthood';

-----------------------------------------------------------------------
-- THING TEMPLATES - Backpacking
-----------------------------------------------------------------------
-- Backpacking + Warm + Early Adulthood
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Backpacking - Warm - Early Adulthood', a.id, tr.id, ar.id, 'Budget travel with minimal gear'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Backpacking' AND tr.name = 'Warm' AND ar.name = 'Early Adulthood';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Gear', 'Travel backpack', 'pieces', 1, '40-50L capacity'),
    ('Gear', 'Day pack', 'pieces', 1, 'Foldable, 15-20L'),
    ('Clothing', 'Quick-dry t-shirts', 'pieces', 4, 'Minimal wrinkle'),
    ('Clothing', 'Convertible pants', 'pieces', 2, 'Pants to shorts'),
    ('Clothing', 'Travel shorts', 'pieces', 2, 'Lightweight'),
    ('Clothing', 'Quick-dry underwear', 'pieces', 5, 'Quick-dry material'),
    ('Clothing', 'Breathable socks', 'pairs', 4, 'Moisture-wicking'),
    ('Clothing', 'Packable light jacket', 'pieces', 1, 'Compact'),
    ('Clothing', 'Versatile walking shoes', 'pairs', 1, 'Comfortable, versatile'),
    ('Clothing', 'Hostel sandals', 'pairs', 1, 'For hostel showers'),
    ('Toiletries', 'Travel-size toiletries', 'sets', 1, 'TSA compliant'),
    ('Toiletries', 'Microfiber towel', 'pieces', 1, 'Quick-dry, compact'),
    ('Accessories', 'Padlock', 'pieces', 1, 'For hostel lockers'),
    ('Accessories', 'Money belt', 'pieces', 1, 'Security'),
    ('Electronics', 'Universal adapter', 'pieces', 1, 'Multiple countries'),
    ('Electronics', 'High capacity power bank', 'pieces', 1, 'High capacity'),
    ('Health', 'Basic first aid', 'kits', 1, 'Compact version'),
    ('Documents', 'Copies of passport', 'sets', 2, 'Physical and digital')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Backpacking - Warm - Early Adulthood';

-----------------------------------------------------------------------
-- THING TEMPLATES - Safari & Wildlife
-----------------------------------------------------------------------
-- Safari + Warm + Middle Youth
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Safari & Wildlife - Warm - Middle Youth', a.id, tr.id, ar.id, 'Wildlife observation in warm climate'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Safari & Wildlife' AND tr.name = 'Warm' AND ar.name = 'Middle Youth';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Clothing', 'Neutral color shirts', 'pieces', 4, 'Khaki, olive, beige'),
    ('Clothing', 'Safari long pants', 'pieces', 3, 'Insect protection'),
    ('Clothing', 'Safari long-sleeve shirts', 'pieces', 2, 'Sun and insect protection'),
    ('Clothing', 'Wide-brimmed safari hat', 'pieces', 1, 'Sun protection'),
    ('Clothing', 'Safari light jacket', 'pieces', 1, 'Early morning game drives'),
    ('Clothing', 'Closed-toe walking shoes', 'pairs', 1, 'Sturdy'),
    ('Clothing', 'Dust scarf', 'pieces', 1, 'Dust protection'),
    ('Electronics', 'Binoculars', 'pieces', 1, 'Quality optics'),
    ('Electronics', 'Camera with zoom lens', 'sets', 1, 'Wildlife photography'),
    ('Electronics', 'Extra memory cards', 'pieces', 2, 'Lots of photos'),
    ('Electronics', 'Dust-proof camera bag', 'pieces', 1, 'Protection'),
    ('Health', 'DEET insect repellent', 'bottles', 1, 'DEET-based recommended'),
    ('Health', 'Safari sunscreen SPF 50+', 'bottles', 1, 'Strong sun protection'),
    ('Health', 'Anti-malarial medication', 'courses', 1, 'Consult doctor'),
    ('Health', 'Safari first aid kit', 'kits', 1, 'Include antihistamines'),
    ('Accessories', 'Game drive daypack', 'pieces', 1, 'For game drives'),
    ('Documents', 'Wildlife field guide', 'pieces', 1, 'Wildlife identification')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Safari & Wildlife - Warm - Middle Youth';

-----------------------------------------------------------------------
-- THING TEMPLATES - Camping
-----------------------------------------------------------------------
-- Camping + Mild + Prime Youth
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Camping - Mild - Prime Youth', a.id, tr.id, ar.id, 'Outdoor camping in moderate weather'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Camping' AND tr.name = 'Mild' AND ar.name = 'Prime Youth';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Camping Gear', 'Tent with rainfly', 'pieces', 1, 'With rainfly'),
    ('Camping Gear', 'Sleeping bag', 'pieces', 1, 'Appropriate temperature rating'),
    ('Camping Gear', 'Sleeping pad', 'pieces', 1, 'Insulation and comfort'),
    ('Camping Gear', 'Camp stove', 'pieces', 1, 'With fuel'),
    ('Camping Gear', 'Cookware set', 'sets', 1, 'Pot, pan, utensils'),
    ('Camping Gear', 'Food cooler', 'pieces', 1, 'Food storage'),
    ('Camping Gear', 'Camping chairs', 'pieces', 2, 'Portable folding'),
    ('Camping Gear', 'LED lantern', 'pieces', 1, 'LED with batteries'),
    ('Camping Gear', 'Camping headlamp', 'pieces', 1, 'Hands-free lighting'),
    ('Clothing', 'Layered camping clothing', 'sets', 3, 'Day and night temps'),
    ('Clothing', 'Waterproof rain jacket', 'pieces', 1, 'Waterproof'),
    ('Clothing', 'Trail hiking boots', 'pairs', 1, 'Trail worthy'),
    ('Clothing', 'Camp slip-on shoes', 'pairs', 1, 'Comfortable slip-ons'),
    ('Food', 'Non-perishable camp food', 'meals', 6, 'Easy to prepare'),
    ('Food', 'Large water containers', 'pieces', 2, 'Large capacity'),
    ('Accessories', 'Camping multi-tool', 'pieces', 1, 'Camping essential'),
    ('Accessories', 'Paracord rope', 'pieces', 1, 'Multiple uses'),
    ('Health', 'Comprehensive first aid kit', 'kits', 1, 'Comprehensive'),
    ('Hygiene', 'Biodegradable camp soap', 'bottles', 1, 'Eco-friendly'),
    ('Accessories', 'Leave no trace bags', 'pieces', 5, 'Leave no trace')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Camping - Mild - Prime Youth';

-----------------------------------------------------------------------
-- THING TEMPLATES - Children Specific
-----------------------------------------------------------------------
-- Beach Resort + Extreme Heat + Children
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Beach Resort - Extreme Heat - Children', a.id, tr.id, ar.id, 'Beach vacation for kids in hot weather'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Beach Resort' AND tr.name = 'Extreme Heat' AND ar.name = 'Children';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Clothing', 'UV protection swimsuit', 'pieces', 2, 'UPF 50+ recommended'),
    ('Clothing', 'Rash guard', 'pieces', 2, 'Long-sleeve sun protection'),
    ('Clothing', 'Kids sun hat', 'pieces', 1, 'Wide brim, chin strap'),
    ('Clothing', 'Light cotton kids clothes', 'sets', 4, 'Breathable fabric'),
    ('Clothing', 'Water shoes', 'pairs', 1, 'Protect from hot sand'),
    ('Clothing', 'Kids sandals', 'pairs', 1, 'Easy on/off'),
    ('Sun Protection', 'Kids sunscreen SPF 50+', 'bottles', 2, 'Reef-safe, gentle'),
    ('Sun Protection', 'Kids after-sun lotion', 'bottles', 1, 'Aloe vera for kids'),
    ('Beach Toys', 'Beach toys set', 'sets', 1, 'Bucket, shovel, molds'),
    ('Beach Toys', 'Inflatable floaties', 'pieces', 1, 'Age-appropriate'),
    ('Accessories', 'Portable beach umbrella', 'pieces', 1, 'Portable shade'),
    ('Accessories', 'Kids beach tent', 'pieces', 1, 'Baby shade shelter'),
    ('Health', 'Kids insect repellent', 'bottles', 1, 'DEET-free options'),
    ('Health', 'Kids first aid kit', 'kits', 1, 'Child-specific supplies'),
    ('Snacks', 'Healthy kids snacks', 'portions', 10, 'Non-melting options'),
    ('Hydration', 'Kids water bottles', 'pieces', 2, 'Spill-proof'),
    ('Entertainment', 'Waterproof kids toys', 'sets', 1, 'Pool and beach safe')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Beach Resort - Extreme Heat - Children';

-----------------------------------------------------------------------
-- THING TEMPLATES - Senior Travelers
-----------------------------------------------------------------------
-- Cruise + Mild + Seniority
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Cruise - Mild - Seniority', a.id, tr.id, ar.id, 'Cruise vacation for senior travelers'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Cruise' AND tr.name = 'Mild' AND ar.name = 'Seniority';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Clothing', 'Smart casual cruise outfits', 'sets', 4, 'Dining room attire'),
    ('Clothing', 'Formal cruise wear', 'sets', 2, 'Captain dinner nights'),
    ('Clothing', 'Comfortable cruise shoes', 'pairs', 2, 'Ship and excursions'),
    ('Clothing', 'Cruise light sweater', 'pieces', 2, 'Air-conditioned areas'),
    ('Clothing', 'Cruise swimsuit', 'pieces', 1, 'Pool and spa'),
    ('Clothing', 'Cruise sun hat', 'pieces', 1, 'Deck protection'),
    ('Clothing', 'Casual cruise daywear', 'sets', 5, 'Comfortable and loose'),
    ('Health', 'Prescription medications', 'supply', 1, 'Full trip plus extra'),
    ('Health', 'Seasickness medication', 'packs', 1, 'Just in case'),
    ('Health', 'Daily cruise vitamins', 'bottles', 1, 'Maintain routine'),
    ('Health', 'Reading glasses', 'pairs', 2, 'Spare pair essential'),
    ('Health', 'Cruise deck sunscreen', 'bottles', 1, 'Deck time protection'),
    ('Accessories', 'Scenic viewing binoculars', 'pieces', 1, 'Scenic viewing'),
    ('Accessories', 'Port excursion day bag', 'pieces', 1, 'Port excursions'),
    ('Electronics', 'Cruise phone and charger', 'sets', 1, 'Keep in touch'),
    ('Electronics', 'Memory camera', 'pieces', 1, 'Capture memories'),
    ('Documents', 'Cruise documents folder', 'folders', 1, 'Printed copies'),
    ('Documents', 'Travel insurance policy', 'policies', 1, 'Medical coverage'),
    ('Comfort', 'Cruise reading material', 'pieces', 1, 'Relaxation time')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Cruise - Mild - Seniority';

-----------------------------------------------------------------------
-- THING TEMPLATES - Road Trip
-----------------------------------------------------------------------
-- Road Trip + Warm + Middle Youth
INSERT INTO thing_templates (name, activity_id, temperature_ranges_id, age_ranges_id, notes)
SELECT 'Road Trip - Warm - Middle Youth', a.id, tr.id, ar.id, 'Car travel adventure in warm weather'
FROM activities a, temperature_ranges tr, age_ranges ar
WHERE a.name = 'Road Trip' AND tr.name = 'Warm' AND ar.name = 'Middle Youth';

INSERT INTO template_things (template_id, category, name, units, value, notes)
SELECT tt.id, v.category, v.name, v.units, v.value, v.notes 
FROM thing_templates tt,
(VALUES
    ('Clothing', 'Casual comfortable clothes', 'sets', 5, 'Mix and match'),
    ('Clothing', 'Road trip comfortable shoes', 'pairs', 2, 'Walking and driving'),
    ('Clothing', 'Road trip light jacket', 'pieces', 1, 'Variable temperatures'),
    ('Clothing', 'Road sunglasses', 'pieces', 1, 'Driving essential'),
    ('Vehicle', 'Car emergency kit', 'kits', 1, 'Safety essential'),
    ('Vehicle', 'Jumper cables', 'sets', 1, 'Emergency backup'),
    ('Vehicle', 'Spare tire check', 'items', 1, 'Ensure properly inflated'),
    ('Vehicle', 'Road maps', 'pieces', 1, 'Offline navigation'),
    ('Electronics', 'Car phone charger', 'pieces', 2, 'Multiple ports'),
    ('Electronics', 'GPS device backup', 'pieces', 1, 'Backup navigation'),
    ('Electronics', 'Road trip camera', 'pieces', 1, 'Document journey'),
    ('Food', 'Road trip cooler', 'pieces', 1, 'Snacks and drinks'),
    ('Food', 'Road snacks variety', 'portions', 10, 'Healthy options'),
    ('Food', 'Reusable road water bottles', 'pieces', 3, 'Stay hydrated'),
    ('Entertainment', 'Road trip playlist', 'items', 1, 'Downloaded music'),
    ('Entertainment', 'Audiobooks', 'items', 3, 'Long drives'),
    ('Accessories', 'Travel pillow', 'pieces', 2, 'Passenger comfort'),
    ('Accessories', 'Blanket', 'pieces', 1, 'Emergency and comfort'),
    ('Documents', 'Vehicle registration', 'items', 1, 'Keep in car'),
    ('Documents', 'Insurance documents', 'items', 1, 'Required')
) AS v(category, name, units, value, notes)
WHERE tt.name = 'Road Trip - Warm - Middle Youth';


commit;