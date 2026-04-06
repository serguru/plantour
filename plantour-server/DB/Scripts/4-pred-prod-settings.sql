begin;
insert into plantour.settings (key, value, value_type)
values 
    ('user_entities_logging_days', '16', 'integer'),
    ('user_email_confirmation_url', 'https://p01--plantour-production-client--lk6ygl5ks8dh.code.run/confirm-email', 'string'),
    ('temporary_user_duration_days', '14', 'integer'),
    ('email_confirmation_token_minutes', '60',  'integer'),
    ('user_token_expiration_minutes', '1440',  'integer'),
    ('checkout_session_success_url', 'profile',  'string'),
    ('checkout_session_cancel_url', 'profile',  'string'),
    ('admin_email', 'admin@plantour.app',  'string'),
    ('support_email', 'support@plantour.app',  'string'),
    ('send_email_user_created', 'true',  'boolean'),
    ('app_version', '2.15.7',  'string'),
    ('exclude_paths_from_log', 'users/health-check;users/version;version',  'string'),
    ('global_spinner_timeout_sec', '30',  'integer'),
    ('plantour_app_origin', 'https://p01--plantour-production-client--lk6ygl5ks8dh.code.run',  'string');
commit;