namespace pack_api.Infrastructure.Supabase;

public class SupabaseOptions
{
    public string Url { get; init; } = default!;           // e.g. https://xyzcompany.supabase.co
    public string ApiKey { get; init; } = default!;        // anon/public key (do NOT use service_role in clients)
    public string AuthUrl { get; init; } = default!;       // e.g. https://xyzcompany.supabase.co/auth/v1
    public string OpenIdConfigUrl { get; init; } = default!; // optional .well-known endpoint for JWKS
    public string Audience { get; init; } = default!;      // expected audience in tokens (optional)
}