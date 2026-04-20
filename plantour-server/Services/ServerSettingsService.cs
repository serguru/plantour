using plantour_server.Logging;
using plantour_server.Repositories;
using PlantourApi.Middleware;

namespace plantour_server.Services;

public static class ServerSettingKeys
{
    public const string JwtAccessTokenExpirationMinutes = "jwt_access_token_expiration_minutes";
    public const string JwtRefreshTokenExpirationDays = "jwt_refresh_token_expiration_days";
    public const string JwtTemporaryUserAccessTokenExpirationDays = "jwt_temporary_user_access_token_expiration_days";
    public const string JwtTemporaryUserAccessDays = "jwt_temporary_user_access_days";
    public const string JwtSignInEmailTokenMinutes = "jwt_sign_in_email_token_minutes";
    public const string SignInEmailBaseUrl = "sign_in_email_base_url";
    public const string SocialAuthGoogleOAuthDefaultReturnUrl = "social_auth_google_oauth_default_return_url";
    public const string BrevoApiBaseUrl = "brevo_api_base_url";
    public const string BrevoSenderEmail = "brevo_sender_email";
    public const string BrevoSenderName = "brevo_sender_name";
    public const string GeminiApiBaseUrl = "gemini_api_base_url";
    public const string GeminiModel = "gemini_model";
    public const string TripNoteEditorDropboxRedirectUri = "trip_note_editor_dropbox_redirect_uri";
    public const string CacheRefreshIntervalMinutes = "cache_refresh_interval_minutes";
    public const string PaymentProcessorApiBaseUrl = "payment_processor_api_base_url";
    public const string PaymentProcessorStoreId = "payment_processor_storeId";
    public const string CorsAllowedOrigins = "cors_allowed_origins";
    public const string TurnstileEnabled = "turnstile_enabled";
    public const string PlantourLoggingSink = "plantour_logging_sink";
    public const string PlantourLoggingQueueCapacity = "plantour_logging_queue_capacity";
    public const string PlantourLoggingBatchSize = "plantour_logging_batch_size";
    public const string PlantourLoggingFlushIntervalMilliseconds = "plantour_logging_flush_interval_milliseconds";
    public const string PlantourLoggingConsoleFallbackEnabled = "plantour_logging_console_fallback_enabled";
}

public sealed class ServerSettingsService(SettingsRepository settingsRepository)
{
    private readonly SettingsRepository _settingsRepository = settingsRepository;

    public async Task<JwtRuntimeSettings> GetJwtRuntimeSettingsAsync()
    {
        return new JwtRuntimeSettings(
            await GetRequiredIntAsync(ServerSettingKeys.JwtAccessTokenExpirationMinutes),
            await GetRequiredIntAsync(ServerSettingKeys.JwtRefreshTokenExpirationDays),
            await GetRequiredIntAsync(ServerSettingKeys.JwtTemporaryUserAccessTokenExpirationDays),
            await GetRequiredIntAsync(ServerSettingKeys.JwtTemporaryUserAccessDays),
            await GetRequiredIntAsync(ServerSettingKeys.JwtSignInEmailTokenMinutes));
    }

    public async Task<int> GetJwtTemporaryUserAccessTokenExpirationDaysAsync()
    {
        return await GetRequiredIntAsync(ServerSettingKeys.JwtTemporaryUserAccessTokenExpirationDays);
    }

    public async Task<int> GetSignInEmailTokenMinutesAsync()
    {
        return await GetRequiredIntAsync(ServerSettingKeys.JwtSignInEmailTokenMinutes);
    }

    public async Task<string> GetSignInEmailBaseUrlAsync()
    {
        return await GetRequiredStringAsync(ServerSettingKeys.SignInEmailBaseUrl);
    }

    public async Task<string> GetGoogleOAuthDefaultReturnUrlAsync()
    {
        return await GetRequiredStringAsync(ServerSettingKeys.SocialAuthGoogleOAuthDefaultReturnUrl);
    }

    public async Task<BrevoRuntimeSettings> GetBrevoRuntimeSettingsAsync()
    {
        return new BrevoRuntimeSettings(
            await GetRequiredStringAsync(ServerSettingKeys.BrevoApiBaseUrl),
            await GetRequiredStringAsync(ServerSettingKeys.BrevoSenderEmail),
            await GetRequiredStringAsync(ServerSettingKeys.BrevoSenderName));
    }

    public async Task<GeminiRuntimeSettings> GetGeminiRuntimeSettingsAsync()
    {
        return new GeminiRuntimeSettings(
            await GetRequiredStringAsync(ServerSettingKeys.GeminiApiBaseUrl),
            await GetRequiredStringAsync(ServerSettingKeys.GeminiModel));
    }

    public async Task<string> GetTripNoteEditorDropboxRedirectUriAsync()
    {
        return await GetRequiredStringAsync(ServerSettingKeys.TripNoteEditorDropboxRedirectUri);
    }

    public async Task<int> GetCacheRefreshIntervalMinutesAsync()
    {
        return Math.Max(1, await GetRequiredIntAsync(ServerSettingKeys.CacheRefreshIntervalMinutes));
    }

    public async Task<string> GetPaymentProcessorApiBaseUrlAsync()
    {
        return await GetRequiredStringAsync(ServerSettingKeys.PaymentProcessorApiBaseUrl);
    }

    public async Task<string> GetPaymentProcessorStoreIdAsync()
    {
        return await GetRequiredStringAsync(ServerSettingKeys.PaymentProcessorStoreId);
    }

    public async Task<string[]> GetCorsAllowedOriginsAsync()
    {
        var value = await GetRequiredStringAsync(ServerSettingKeys.CorsAllowedOrigins);

        return value
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .ToArray();
    }

    public async Task<bool> GetTurnstileEnabledAsync()
    {
        return await GetRequiredBoolAsync(ServerSettingKeys.TurnstileEnabled);
    }

    public async Task<PlantourLoggerOptions> GetPlantourLoggerOptionsAsync()
    {
        return new PlantourLoggerOptions
        {
            Sink = await GetRequiredStringAsync(ServerSettingKeys.PlantourLoggingSink),
            QueueCapacity = await GetRequiredIntAsync(ServerSettingKeys.PlantourLoggingQueueCapacity),
            BatchSize = await GetRequiredIntAsync(ServerSettingKeys.PlantourLoggingBatchSize),
            FlushIntervalMilliseconds = await GetRequiredIntAsync(ServerSettingKeys.PlantourLoggingFlushIntervalMilliseconds),
            ConsoleFallbackEnabled = await GetRequiredBoolAsync(ServerSettingKeys.PlantourLoggingConsoleFallbackEnabled)
        };
    }

    private async Task<string> GetRequiredStringAsync(string key)
    {
        var value = await _settingsRepository.GetSettingByKey(key) as string;
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new CustomException($"Setting '{key}' is not configured");
        }

        return value.Trim();
    }

    private async Task<int> GetRequiredIntAsync(string key)
    {
        var value = await _settingsRepository.GetSettingByKey(key);
        if (value is int intValue)
        {
            return intValue;
        }

        throw new CustomException($"Setting '{key}' is not a valid integer");
    }

    private async Task<bool> GetRequiredBoolAsync(string key)
    {
        var value = await _settingsRepository.GetSettingByKey(key);
        if (value is bool boolValue)
        {
            return boolValue;
        }

        throw new CustomException($"Setting '{key}' is not a valid boolean");
    }
}

public sealed record JwtRuntimeSettings(
    int AccessTokenExpirationMinutes,
    int RefreshTokenExpirationDays,
    int TemporaryUserAccessTokenExpirationDays,
    int TemporaryUserAccessDays,
    int SignInEmailTokenMinutes);

public sealed record BrevoRuntimeSettings(
    string ApiBaseUrl,
    string SenderEmail,
    string SenderName);

public sealed record GeminiRuntimeSettings(
    string ApiBaseUrl,
    string Model);