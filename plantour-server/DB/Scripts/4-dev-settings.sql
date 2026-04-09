begin;

insert into plantour.settings (key, value, value_type)
values 
    ('user_entities_logging_days', '16', 'integer'),
    ('user_email_confirmation_url', 'http://localhost:4203/confirm-email', 'string'),
    ('temporary_user_duration_days', '14', 'integer'),
    ('email_confirmation_token_minutes', '60',  'integer'),
    ('user_token_expiration_minutes', '1440',  'integer'),
    ('checkout_session_success_url', 'profile',  'string'),
    ('checkout_session_cancel_url', 'profile',  'string'),
    ('admin_email', 'admin@plantour.app',  'string'),
    ('support_email', 'support@plantour.app',  'string'),
    ('send_email_user_created', 'true',  'boolean'),
    ('app_version', '0.0.0',  'string'),
    ('exclude_paths_from_log', 'users/health-check;users/version;version',  'string'),
    ('global_spinner_timeout_sec', '30',  'integer'),
    ('plantour_app_origin', 'http://localhost:4203',  'string');


insert into plantour.plans (name, paddle_product_id, notes, public, 
allowed_items,  allowed_travelers,  allowed_AI_prompts,         extended_AI_allowed,
allowed_todos,  allowed_expenses,   allowed_itinerary_parts,    allowed_activities) values

('Starter', null, 'Suitable for short and easy trips alone or in pairs', true, 
10,             2,                  5,                          false, 
3,              3,                  3,                          6
),

('Family', 'pro_01khvs7gpz701mh82v0p500mcn', 'Perfect for regular travelers, families and small groups', true, 
250,           5,                  20,                        false,
100,           500,                20,                        100
),

('Expedition', 'pro_01khvsa34wt2mg7nqac3c45jyc', 'Ideal for advanced travelers, large groups and expeditions', true, 
2500,           50,                 100,                      true,
1000,           5000,               50,                       1000
);


insert into plantour.prices (paddle_price_id,plan_id,name,value_cents) values
(
    null,
    (select id from plantour.plans where name = 'Starter'),
    'Starter Free',
    0
),
(
    'pri_01khvsx5szpnfqd97c6sdv3e2w',
    (select id from plantour.plans where name = 'Family'),
    'Family Monthly',
    1299
),
(
    'pri_01khvsg62zpjhh6qbmc5sfmkm3',
    (select id from plantour.plans where name = 'Expedition'),
    'Expedition Monthly',
    4499
),
(
    'pri_01khvsyg17b43cm5kf0t63zfnr',
    (select id from plantour.plans where name = 'Family'),
    'Family Yearly',
    11999
),
(
    'pri_01khvspsgmrkcggdxxtksbzy88',
    (select id from plantour.plans where name = 'Expedition'),
    'Expedition Yearly',
    39999
);



    
    
commit;