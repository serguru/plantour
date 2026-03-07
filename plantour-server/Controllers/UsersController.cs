using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Services;
using plantour_server.Services.Interfaces;

namespace plantour_server.Controllers;

// TODO: if a temporary user signs out show them a warning message.

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
        private readonly IUsersService _usersService;
        private readonly ITemporaryUserService _temporaryUserService;
        private readonly IPaddleService _paddleService;
        private readonly IContactSubmissionService _contactSubmissionService;
        private readonly ISchedulerService _schedulerService;

        public UsersController(IUsersService usersService, ITemporaryUserService temporaryUserService, IPaddleService paddleService, IContactSubmissionService contactSubmissionService, ISchedulerService schedulerService)
        {
                _usersService = usersService;
                _temporaryUserService = temporaryUserService;
                _paddleService = paddleService;
                _contactSubmissionService = contactSubmissionService;
                _schedulerService = schedulerService;
        }

        #region Admin Endpoints

        [HttpPost("admin/send-signin-email")]
        [AllowAnonymous]
        public async Task<ActionResult<SignInResponse>> SendSignInEmailAdmin([FromBody] SignInRequest request)
        {
                var response = await _usersService.SendSignInEmailAdminAsync(request);
                return Ok(response);
        }

        [HttpPost("admin/signin-token")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignInAdminToken([FromBody] SignInRequestToken request)
        {
                AuthResponse result = await _usersService.SignInAdminTokenAsync(request.Token);
                return Ok(result);
        }

        // TODO: investigate and fix possible issues with Facebook login
        [HttpPost("admin/social/signin")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignInAdminSocial([FromBody] SocialSignInRequest request)
        {
                var response = await _usersService.SignInAdminSocialAsync(request);
                return Ok(response);
        }

        #endregion

        #region Participant Endpoints

        //TODO: resend participant invitation email

        //TODO: ask AI to add AsNoTracking where possible

        [HttpPost("participant/signup")]
        [AdminOnly]
        public async Task<ActionResult<AdminsParticipantDto>> SignUpParticipant([FromBody] SignUpParticipantRequest request)
        {
                AdminsParticipantDto result = await _usersService.SignUpParticipantAsync(request);
                return Ok(result);
        }

        [HttpPost("participant/signin")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> SignInParticipant([FromBody] SignInParticipantRequest request)
        {
                var response = await _usersService.SignInParticipantAsync(request);
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

        // [Authorize]
        // [HttpGet("validate")]
        // public async Task<IActionResult> ValidateToken()
        // {
        //         var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        //         var isValid = await _usersService.ValidateTokenAsync(token);
        //         return Ok(new { isValid });
        // }

        #endregion

        #region Profile Management

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
                var profile = await _usersService.GetProfileAsync();
                return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<Object>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
                var updatedProfile = await _usersService.UpdateProfileAsync(request);
                return Ok(updatedProfile);
        }

        [HttpPost("profile/social/link")]
        [Authorize]
        public async Task<ActionResult<UserDto>> LinkSocialProvider([FromBody] SocialSignInRequest request)
        {
                var profile = await _usersService.LinkSocialProviderAsync(request);
                return Ok(profile);
        }

        [HttpDelete("profile/social/{provider}")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UnlinkSocialProvider([FromRoute] string provider)
        {
                var profile = await _usersService.UnlinkSocialProviderAsync(provider);
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
                var profile = await _usersService.GetLandingAsync();
                return Ok(profile);
        }

        // TODO: add jobs cleaning code
        // TODO: add to log user creates and deletes entities
        [HttpPut("downgrade-plan-price/schedule")]
        [AdminOnly]
        public async Task<IActionResult> ScheduleOrRunDowngradePlanPrice([FromBody] UpdatePlanPriceRequest request)
        {
                await _schedulerService.ScheduleOrRunDowngradePlanPriceAsync(request.OldPlanPrice, request.NewPlanPrice);
                return Ok();
        }

        [HttpGet("downgrade-plan-price/scheduled")]
        [AdminOnly]
        public async Task<ActionResult<ScheduledPlanDowngradeInfoDto>> GetScheduledDowngradePlanPrice()
        {
                var result = await _usersService.GetScheduledPlanDowngradeInfoAsync();
                return Ok(result);
        }

        [HttpDelete("downgrade-plan-price/scheduled")]
        [AdminOnly]
        public async Task<IActionResult> CancelScheduledDowngradePlanPrice()
        {
                var cancelled = await _usersService.CancelScheduledPlanDowngradeAsync();
                return Ok(new { cancelled });
        }

        [HttpPut("upgrade-plan-price")]
        [AdminOnly]
        public async Task<IActionResult> UpgradePlanPrice([FromBody] UpdatePlanPriceRequest request)
        {
                await _paddleService.UpgradePlanPriceAsync(request.OldPlanPrice, request.NewPlanPrice);
                return Ok();
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestDto request)
        {
                var result = await _usersService.RefreshTokenAsync(request);
                return Ok(result);
        }

        [HttpGet("is-user-temporary")]
        public async Task<ActionResult<bool>> IsUserTemporary([FromQuery] string email)
        {
                if (string.IsNullOrWhiteSpace(email))
                {
                        return BadRequest("Email is required");
                }

                var isTemporary = await _usersService.IsUserTemporary(email);
                return Ok(isTemporary);
        }


}
