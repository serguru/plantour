using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Plantour.Services
{
    /// <summary>
    /// Minimal Clerk integration surface used by the application.
    /// Implemented via Clerk admin REST API.
    /// </summary>
    public interface IClerkAuthService
    {
        /// <summary>
        /// Current resolved clerk user context (if any).
        /// </summary>
        ClerkCurrentUser? CurrentUser { get; }

        /// <summary>
        /// Check whether a user with the specified email exists in Clerk.
        /// </summary>
        Task<bool> UserExistsAsync(string email);

        /// <summary>
        /// Create a user in Clerk. Returns true on success.
        /// </summary>
        Task<bool> SignUpAsync(string email, string password, Dictionary<string, object>? metadata = null);

        /// <summary>
        /// Sign in with email+password. Returns access token (JWT) or null.
        /// </summary>
        Task<string?> SignInAsync(string email, string password);

        /// <summary>
        /// Send magic link (if Clerk project supports it).
        /// </summary>
        Task SendMagicLinkAsync(string email);

        /// <summary>
        /// Trigger password reset for email.
        /// </summary>
        Task ResetPasswordAsync(string email);

        /// <summary>
        /// Sign out (revoke session) if supported.
        /// </summary>
        Task SignOutAsync(string? token = null);

        /// <summary>
        /// Update user public metadata (requires admin scope or user token).
        /// </summary>
        Task UpdateProfileAsync(string clerkUserId, Dictionary<string, object> newMetadata);

        /// <summary>
        /// Verify Clerk token via Clerk admin verify endpoint. Returns true if valid.
        /// </summary>
        Task<bool> ValidateTokenAsync(string token);

        /// <summary>
        /// Try find Clerk user by email and return minimal info (id, email).
        /// </summary>
        Task<ClerkUserInfo?> GetUserByEmailAsync(string email);
    }
}