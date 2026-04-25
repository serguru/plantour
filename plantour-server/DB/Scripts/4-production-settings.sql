begin;
insert into plantour.settings (key, value, value_type)
values 
    ('user_entities_logging_days', '16', 'integer'),
    ('user_email_confirmation_url', 'https://plantour.app/confirm-email', 'string'),
    ('temporary_user_duration_days', '14', 'integer'),
    ('jwt_access_token_expiration_minutes', '30', 'integer'),
    ('jwt_refresh_token_expiration_days', '30', 'integer'),
    ('jwt_temporary_user_access_token_expiration_days', '14', 'integer'),
    ('jwt_temporary_user_access_days', '14', 'integer'),
    ('jwt_sign_in_email_token_minutes', '60', 'integer'),
    ('email_confirmation_token_minutes', '60',  'integer'),
    ('user_token_expiration_minutes', '1440',  'integer'),
    ('sign_in_email_base_url', 'https://plantour.app/signin-token', 'string'),
    ('social_auth_google_oauth_default_return_url', 'https://plantour.app/sign-in', 'string'),
    ('brevo_api_base_url', 'https://api.brevo.com/v3/', 'string'),
    ('brevo_sender_email', 'admin@plantour.app', 'string'),
    ('brevo_sender_name', 'Plantour', 'string'),
    ('gemini_api_base_url', 'https://generativelanguage.googleapis.com/v1beta/', 'string'),
    ('gemini_model', 'gemini-3-flash-preview', 'string'),
    ('trip_note_editor_dropbox_redirect_uri', 'https://api.plantour.app/trip-note-editor/dropbox/callback', 'string'),
    ('cache_refresh_interval_minutes', '5', 'integer'),
    ('payment_processor_api_base_url', 'https://api.stripe.com', 'string'),
    ('payment_processor_storeId', '', 'string'),
    ('cors_allowed_origins', 'https://api.plantour.app;https://plantour.app', 'string'),
    ('turnstile_enabled', 'true', 'boolean'),
    ('plantour_logging_sink', 'Both', 'string'),
    ('plantour_logging_queue_capacity', '1024', 'integer'),
    ('plantour_logging_batch_size', '50', 'integer'),
    ('plantour_logging_flush_interval_milliseconds', '2000', 'integer'),
    ('plantour_logging_console_fallback_enabled', 'true', 'boolean'),
    ('checkout_session_success_url', 'profile',  'string'),
    ('checkout_session_cancel_url', 'profile',  'string'),
    ('admin_email', 'admin@plantour.app',  'string'),
    ('support_email', 'support@plantour.app',  'string'),
    ('send_email_user_created', 'true',  'boolean'),
    ('app_version', '2.16.4',  'string'),
    ('global_spinner_timeout_sec', '30',  'integer'),
    ('exclude_paths_from_log', 'users/health-check;users/version;version',  'string'),
    ('plantour_app_origin', 'https://plantour.app',  'string');

insert into plantour.plans (name, payment_processor_product_id, notes, public, 
allowed_items,  allowed_travelers,  allowed_AI_prompts,         extended_AI_allowed,
allowed_todos,  allowed_expenses,   allowed_itinerary_parts,    allowed_activities) values

('Starter', null, 'Suitable for short and easy trips alone or in pairs', true, 
10,             2,                  5,                          false, 
3,              3,                  3,                          6
),

('Family', 'prod_ULNIguoGZvuNPV', 'Perfect for regular travelers, families and small groups', true, 
250,           5,                  20,                        false,
100,           500,                20,                        100
),

('Expedition', 'prod_ULhZUf7GZeaOTJ', 'Ideal for advanced travelers, large groups and expeditions', true, 
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
    'price_1TMgYCIg8eDk4N019oYy6dNQ',
    (select id from plantour.plans where name = 'Family'),
    'Family Monthly',
    1299
),
(
    'price_1TN0AdIg8eDk4N01B7yFHj1v',
    (select id from plantour.plans where name = 'Expedition'),
    'Expedition Monthly',
    4499
),
(
    'price_1TN096Ig8eDk4N01jpGh58OD',
    (select id from plantour.plans where name = 'Family'),
    'Family Yearly',
    11999
),
(
    'price_1TN0BPIg8eDk4N01xANBw6iq',
    (select id from plantour.plans where name = 'Expedition'),
    'Expedition Yearly',
    39999
);

commit;