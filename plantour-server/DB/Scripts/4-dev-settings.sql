begin;

insert into plantour.settings (key, value, value_type)
values 
    ('user_entities_logging_days', '16', 'integer'),
    ('user_email_confirmation_url', 'http://localhost:4203/confirm-email', 'string'),
    ('temporary_user_duration_days', '14', 'integer'),
    ('jwt_access_token_expiration_minutes', '30', 'integer'),
    ('jwt_refresh_token_expiration_days', '30', 'integer'),
    ('jwt_temporary_user_access_token_expiration_days', '14', 'integer'),
    ('jwt_temporary_user_access_days', '14', 'integer'),
    ('jwt_sign_in_email_token_minutes', '60', 'integer'),
    ('email_confirmation_token_minutes', '60',  'integer'),
    ('user_token_expiration_minutes', '1440',  'integer'),
    ('sign_in_email_base_url', 'http://localhost:4203/signin-token', 'string'),
    ('social_auth_google_oauth_default_return_url', 'http://localhost:4203/sign-in', 'string'),
    ('brevo_api_base_url', 'https://api.brevo.com/v3/', 'string'),
    ('brevo_sender_email', 'admin@plantour.app', 'string'),
    ('brevo_sender_name', 'Plantour', 'string'),
    ('gemini_api_base_url', 'https://generativelanguage.googleapis.com/v1beta/', 'string'),
    ('gemini_model', 'gemini-3-flash-preview', 'string'),
    ('trip_note_editor_dropbox_redirect_uri', 'http://localhost:5217/trip-note-editor/dropbox/callback', 'string'),
    ('cache_refresh_interval_minutes', '5', 'integer'),
    ('payment_processor_api_base_url', 'https://api.stripe.com/v1/', 'string'),
    ('payment_processor_storeId', '', 'string'),
    ('cors_allowed_origins', 'http://localhost:4203;http://192.168.4.34:5217;http://192.168.4.34:4203', 'string'),
    ('turnstile_enabled', 'false', 'boolean'),
    ('plantour_logging_sink', 'Database', 'string'),
    ('plantour_logging_queue_capacity', '1024', 'integer'),
    ('plantour_logging_batch_size', '50', 'integer'),
    ('plantour_logging_flush_interval_milliseconds', '2000', 'integer'),
    ('plantour_logging_console_fallback_enabled', 'true', 'boolean'),
    ('checkout_session_success_url', 'profile',  'string'),
    ('checkout_session_cancel_url', 'profile',  'string'),
    ('admin_email', 'admin@plantour.app',  'string'),
    ('support_email', 'support@plantour.app',  'string'),
    ('send_email_user_created', 'true',  'boolean'),
    ('app_version', '0.0.0',  'string'),
    ('exclude_paths_from_log', 'users/health-check;users/version;version',  'string'),
    ('global_spinner_timeout_sec', '30',  'integer'),
    ('plantour_app_origin', 'http://localhost:4203',  'string');


insert into plantour.plans (name, payment_processor_product_id, notes, public, 
allowed_items,  allowed_travelers,  allowed_AI_prompts,         extended_AI_allowed,
allowed_todos,  allowed_expenses,   allowed_itinerary_parts,    allowed_activities) values

('Starter', null, 'Suitable for short and easy trips alone or in pairs', true, 
10,             2,                  5,                          false, 
3,              3,                  3,                          6
),

('Family', 'prod_ULiO08LwHgy75x', 'Perfect for regular travelers, families and small groups', true, 
250,           5,                  20,                        false,
100,           500,                20,                        100
),

('Expedition', 'prod_ULiQYAzcDOPFYz', 'Ideal for advanced travelers, large groups and expeditions', true, 
2500,           50,                 100,                      true,
1000,           5000,               50,                       1000
);


insert into plantour.prices (payment_processor_price_id,plan_id,name,value_cents) values
(
    null,
    (select id from plantour.plans where name = 'Starter'),
    'Starter Free',
    0
),
(
    'price_1TN0xsI2UMZqfzy8etfK5nJL',
    (select id from plantour.plans where name = 'Family'),
    'Family Monthly',
    1299
),
(
    'price_1TN0zzI2UMZqfzy8491IVApy',
    (select id from plantour.plans where name = 'Expedition'),
    'Expedition Monthly',
    4499
),
(
    'price_1TN0zCI2UMZqfzy8ngNKuuux',
    (select id from plantour.plans where name = 'Family'),
    'Family Yearly',
    11999
),
(
    'price_1TN10oI2UMZqfzy8mdsq4wyW',
    (select id from plantour.plans where name = 'Expedition'),
    'Expedition Yearly',
    39999
);



    
    
commit;