set search_path to plantour, public;

BEGIN;

-- USER THINGS
INSERT INTO user_things (user_id, category, name, units, value, notes) VALUES
((SELECT id FROM users WHERE email='serguru@gmail.com'),'Clothing','Жёлтый дождевик','pcs',1,'Waterproof'),
((SELECT id FROM users WHERE email='serguru@gmail.com'),'Electronics','Power bank Anker 20k','pcs',1,NULL),
((SELECT id FROM users WHERE email='serguru@gmail.com'),'Travel Essentials','Паспорт','pcs',1,NULL),
((SELECT id FROM users WHERE email='alice.participant@plantour.test'),'Clothing','Красная куртка','pcs',1,NULL),
((SELECT id FROM users WHERE email='bob.participant@plantour.test'),'Food & Snacks','Протеиновый батончик','pcs',3,NULL);

-- USER PACKAGES
INSERT INTO user_packages (user_id, name, description) VALUES
((SELECT id FROM users WHERE email='serguru@gmail.com'),'Жёлтый чемодан','Основной чемодан для поездок'),
((SELECT id FROM users WHERE email='serguru@gmail.com'),'Синяя сумка','Ручная кладь'),
((SELECT id FROM users WHERE email='alice.participant@plantour.test'),'Рюкзак Alice','Горный рюкзак 45L'),
((SELECT id FROM users WHERE email='bob.participant@plantour.test'),'Рюкзак Bob','Дневной рюкзак 25L');

-- TRIPS
INSERT INTO trips (user_id, trip_status, name, description, start_date, end_date) VALUES
((SELECT id FROM users WHERE email='serguru@gmail.com'),'Planning','Поездка в Йосемити','Хайкинг и кемпинг', '2025-06-10','2025-06-20'),
((SELECT id FROM users WHERE email='serguru@gmail.com'),'Active','Поездка в Викторию','Короткий уикенд', '2025-05-02','2025-05-04');

-- TRIP USERS
INSERT INTO trip_users (trip_id, user_id, notes) VALUES
((SELECT id FROM trips WHERE name='Поездка в Йосемити'), (SELECT id FROM users WHERE email='serguru@gmail.com'),'Organizer'),
((SELECT id FROM trips WHERE name='Поездка в Йосемити'), (SELECT id FROM users WHERE email='alice.participant@plantour.test'),'Participant'),
((SELECT id FROM trips WHERE name='Поездка в Викторию'), (SELECT id FROM users WHERE email='serguru@gmail.com'),'Organizer'),
((SELECT id FROM trips WHERE name='Поездка в Викторию'), (SELECT id FROM users WHERE email='bob.participant@plantour.test'),'Participant');

-- TRIP USER PACKAGES
INSERT INTO trip_user_packages (trip_user_id, name, label, packing_status, packing_list_included)
VALUES
(
    (SELECT tu.id
     FROM trip_users tu
     JOIN trips t ON t.id = tu.trip_id
     WHERE t.name = 'Поездка в Йосемити'
       AND tu.user_id = (SELECT id FROM users WHERE email='serguru@gmail.com')
    ),
    'Жёлтый чемодан',
    'Main',
    'Planning',
    true
),
(
    (SELECT tu.id
     FROM trip_users tu
     JOIN trips t ON t.id = tu.trip_id
     WHERE t.name = 'Поездка в Викторию'
       AND tu.user_id = (SELECT id FROM users WHERE email='bob.participant@plantour.test')
    ),
    'Рюкзак Bob',
    'Daypack',
    'Active',
    true
);

-- TRIP USER THINGS
INSERT INTO trip_user_things (trip_user_id, category, name, units, value, trip_user_package_id, packing_status)
VALUES
(
    (SELECT tu.id
     FROM trip_users tu
     JOIN trips t ON t.id = tu.trip_id
     WHERE t.name = 'Поездка в Йосемити'
       AND tu.user_id = (SELECT id FROM users WHERE email='serguru@gmail.com')
    ),
    'Clothing',
    'Жёлтый дождевик',
    'pcs',
    1,
    (SELECT tup.id FROM trip_user_packages tup WHERE tup.name='Жёлтый чемодан'),
    'Planning'
),
(
    (SELECT tu.id
     FROM trip_users tu
     JOIN trips t ON t.id = tu.trip_id
     WHERE t.name = 'Поездка в Викторию'
       AND tu.user_id = (SELECT id FROM users WHERE email='bob.participant@plantour.test')
    ),
    'Food & Snacks',
    'Протеиновый батончик',
    'pcs',
    2,
    (SELECT tup.id FROM trip_user_packages tup WHERE tup.name='Рюкзак Bob'),
    'Active'
);

commit;