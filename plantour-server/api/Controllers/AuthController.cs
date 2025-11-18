using Microsoft.AspNetCore.Mvc;
using Plantour.Infrastructure.Dtos;
using Plantour.Services;
using Supabase.Gotrue;

namespace Plantour.Auth.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ISupabaseAuthService _auth;

        public AuthController(ISupabaseAuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpRequest dto)
        {
            User? user = _auth.GetUserByEmail(dto.Email);
            if (user != null)
            {
                string message = $"A user with email address {dto.Email} already exists";

                bool email_verified = user.UserMetadata != null &&
                                      user.UserMetadata.ContainsKey("email_verified") &&
                                      user.UserMetadata["email_verified"] is bool ev &&
                                      ev;

                if (!email_verified)
                {
                    message += ". Please follow the link in the email sent to you to confirm your registration.";
                }
                return BadRequest(new { error = message });
            }

            user = await _auth.SignUpAsync(dto.Email, dto.Password, dto.Metadata);
            if (user == null) 
            {
                return BadRequest(new { error = "Null user returned" });
            }
            return Ok(new { user.Id, user.Email, user.UserMetadata });
        }

        [HttpPost("signin")]
        public async Task<IActionResult> SignIn([FromBody] LoginRequest dto)
        {
            var session = await _auth.LoginWithPasswordAsync(dto.Email, dto.Password);
            if (session == null) return Unauthorized();
            return Ok(new
            {
                token = session.AccessToken,
            });
        }

        [HttpPost("magic-link")]
        public async Task<IActionResult> MagicLink([FromBody] MagicLinkRequest dto)
        {
            await _auth.SendMagicLinkAsync(dto.Email);
            return Ok(new { message = "If the email exists, a sign-in link was sent." });
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest dto)
        {
            await _auth.ResetPasswordAsync(dto.Email);
            return Ok(new { message = "If the email exists, a reset link was sent." });
        }

        // This endpoint demonstrates signing out using the server-side client instance
        // (useful for server processes that keep a session).
        [HttpPost("signout")]
        public async Task<IActionResult> SignOut()
        {
            await _auth.LogoutAsync();
            return Ok(new { message = "signed_out" });
        }
    }
}
