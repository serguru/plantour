using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Services;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
        private readonly IUsersService _authService;
        private readonly ITemporaryUserService _temporaryUserService;
        private readonly IContactSubmissionService _contactSubmissionService;

        public UsersController(IUsersService authService, ITemporaryUserService temporaryUserService, IContactSubmissionService contactSubmissionService)
        {
                _authService = authService;
                _temporaryUserService = temporaryUserService;
                _contactSubmissionService = contactSubmissionService;
        }

        #region Admin Endpoints

        [HttpPost("admin/signup")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignUpAdmin([FromBody] SignUpRequest request)
        {
                // TODO: take into account that only active users can sign up
                // TODO: remove temporary accounts as necessary
                // TODO: add email verification step
                // TODO: add "I want to receive promotional emails" checkbox
                var response = await _authService.SignUpAsync(request);
                return Ok(response);
        }

        [HttpPost("admin/signin")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignInAdmin([FromBody] SignInRequest request)
        {
               // throw new NotImplementedException("Not implemented yet");
                var response = await _authService.SignInAsync(request);
                return Ok(response);
        }

        [HttpPost("admin/confirm-email")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
        {
                var confirmed = await _authService.ConfirmEmailAsync(request);
                return Ok(new { confirmed });
        }

        [HttpPost("admin/resend-confirmation")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendConfirmation([FromBody] ResendEmailConfirmationRequest request)
        {
                await _authService.SendEmailConfirmationAsync(request);
                return Ok(new { sent = true });
        }

        #endregion

        #region Participant Endpoints

        [HttpPost("participant/signup")]
        [AdminOnly]
        public async Task<ActionResult<AdminsParticipantDto>> SignUpParticipant([FromBody] SignUpParticipantRequest request)
        {
                AdminsParticipantDto result = await _authService.SignUpParticipantAsync(request);
                return Ok(result);
        }

        [HttpPost("participant/signin")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignInParticipant([FromBody] SignInParticipantRequest request)
        {
                var response = await _authService.SignInParticipantAsync(request);
                return Ok(response);
        }

        #endregion

        #region Temporary User Endpoints

        [HttpPost("create-temporary-user")]
        [AllowAnonymous]
        public async Task<ActionResult<CreateTemporaryUserResponse>> CreateTemporaryUser()
        {
                var response = await _temporaryUserService.CreateTemporaryUserAsync();
                return Ok(response);
        }

        #endregion

        #region Common Endpoints

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var response = await _authService.RefreshTokenAsync(request, ipAddress);
                return Ok(response);
        }

        [HttpPost("revoke")]
        [AllowAnonymous]
        public async Task<IActionResult> RevokeRefreshToken([FromBody] RevokeRefreshTokenRequest request)
        {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _authService.RevokeRefreshTokenAsync(request, ipAddress);
                return Ok(new { revoked = true });
        }

        [Authorize]
        [HttpGet("validate")]
        public async Task<IActionResult> ValidateToken()
        {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                var isValid = await _authService.ValidateTokenAsync(token);
                return Ok(new { isValid });
        }

        #endregion

        #region Profile Management

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
                var profile = await _authService.GetProfileAsync();
                return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
                var updatedProfile = await _authService.UpdateProfileAsync(request);
                return Ok(updatedProfile);
        }

        [HttpPut("password")]
        [Authorize]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
        {
                await _authService.UpdatePasswordAsync(request);
                return Ok(new { updated = true });
        }

        #endregion

        #region Contact Submission Endpoints

        [HttpPost("contact/submit")]
        [AllowAnonymous]
        public async Task<ActionResult<ContactSubmissionDto>> SubmitContact([FromBody] ContactSubmissionRequest request)
        {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var userAgent = Request.Headers["User-Agent"].ToString();
                var referrerUrl = Request.Headers["Referer"].ToString();

                var result = await _contactSubmissionService.SubmitContactAsync(request, ipAddress, userAgent, referrerUrl);
                return Ok(result);
        }

        #endregion

        [HttpGet("landing")]
        public async Task<ActionResult<LandingDto>> GetLanding()
        {
                var profile = await _authService.GetLandingAsync();
                return Ok(profile);
        }


}
