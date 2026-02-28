using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Services;

namespace plantour_server.Controllers;

// TODO: if a temporary user signs out show them a warning message.

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
        private readonly IUsersService _authService;
        private readonly ITemporaryUserService _temporaryUserService;
        private readonly IPaddleService _paddleService;
        private readonly IContactSubmissionService _contactSubmissionService;

        public UsersController(IUsersService authService, ITemporaryUserService temporaryUserService, IPaddleService paddleService, IContactSubmissionService contactSubmissionService)
        {
                _authService = authService;
                _temporaryUserService = temporaryUserService;
                _paddleService = paddleService;
                _contactSubmissionService = contactSubmissionService;
        }

        #region Admin Endpoints

        [HttpPost("admin/signup")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignUpAdmin([FromBody] SignUpRequest request)
        {
                // TODO: take into account that only active users can sign in
                // TODO: remove temporary accounts as necessary
                // TODO: add email verification step
                // TODO: add "I want to receive promotional emails" checkbox
                // TODO: find out how do I legally not return money for subscription
                var response = await _authService.SignUpAsync(request);
                return Ok(response);
        }

        [HttpPost("admin/signin")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignInAdmin([FromBody] SignInRequest request)
        {
                var response = await _authService.SignInAsync(request);
                return Ok(response);
        }

        // TODO: investigate and fix possible issues with Facebook login
        [HttpPost("admin/social/signin")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignInAdminSocial([FromBody] SocialSignInRequest request)
        {
                var response = await _authService.SignInAdminSocialAsync(request);
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

        [HttpPost("profile/social/link")]
        [Authorize]
        public async Task<ActionResult<UserDto>> LinkSocialProvider([FromBody] SocialSignInRequest request)
        {
                var profile = await _authService.LinkSocialProviderAsync(request);
                return Ok(profile);
        }

        [HttpDelete("profile/social/{provider}")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UnlinkSocialProvider([FromRoute] string provider)
        {
                var profile = await _authService.UnlinkSocialProviderAsync(provider);
                return Ok(profile);
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


        [HttpPut("change-plan-price")]
        [AdminOnly]
        public async Task<IActionResult> ChangePlanPrice([FromBody] UpdatePlanPriceRequest request)
        {
                await _paddleService.ChangePlanPriceAsync(request.OldPlanPrice, request.NewPlanPrice);
                return Ok();
        }
}
