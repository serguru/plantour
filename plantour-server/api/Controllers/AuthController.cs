using Microsoft.AspNetCore.Mvc;
using Plantour.Infrastructure.Dtos;
using Plantour.Services;
using System.Threading.Tasks;

namespace Plantour.Auth.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IClerkAuthService _auth;

        public AuthController(IClerkAuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpRequest dto)
        {
            // Check if a user with this email already exists in Clerk
            if (await _auth.UserExistsAsync(dto.Email))
            {
                var message = $"A user with email address {dto.Email} already exists";
                return BadRequest(new { error = message });
            }

            // Attempt to create user in Clerk
            var created = await _auth.SignUpAsync(dto.Email, dto.Password, dto.Metadata);
            if (!created)
            {
                return BadRequest(new { error = "Sign up failed" });
            }

            // Return minimal response (avoid exposing Clerk internals)
            return Ok(new { message = "signup_requested" });
        }

        [HttpPost("signin")]
        public async Task<IActionResult> SignIn([FromBody] LoginRequest dto)
        {
            var token = await _auth.SignInAsync(dto.Email, dto.Password);
            if (string.IsNullOrEmpty(token)) return Unauthorized();
            return Ok(new { token });
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

        [HttpPost("signout")]
        public new async Task<IActionResult> SignOut()
        {
            // Optionally read Authorization header to revoke a specific token
            var authHeader = Request.Headers["Authorization"].ToString();
            string? token = null;
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                token = authHeader.Substring("Bearer ".Length).Trim();

            await _auth.SignOutAsync(token);
            return Ok(new { message = "signed_out" });
        }
    }
}
