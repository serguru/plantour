using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using plantour_server.Attributes;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using plantour_server.Services;
using plantour_server.Services.Interfaces;

namespace plantour_server.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController : ControllerBase
{
        private readonly IUsersService _usersService;
        private readonly ITemporaryUserService _temporaryUserService;
        private readonly IPaddleService _paddleService;
        private readonly IContactSubmissionService _contactSubmissionService;
        private readonly ISchedulerService _schedulerService;
        private readonly IBotProtectionService _botProtectionService;
        private readonly IWebHostEnvironment _environment;

        public UsersController(IUsersService usersService, ITemporaryUserService temporaryUserService, IPaddleService paddleService, IContactSubmissionService contactSubmissionService, ISchedulerService schedulerService, IBotProtectionService botProtectionService, IWebHostEnvironment environment)
        {
                _usersService = usersService;
                _temporaryUserService = temporaryUserService;
                _paddleService = paddleService;
                _contactSubmissionService = contactSubmissionService;
                _schedulerService = schedulerService;
                _botProtectionService = botProtectionService;
                _environment = environment;
        }

        #region Admin Endpoints

        [HttpPost("admin/send-signin-email")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-signin-email")]
        public async Task<ActionResult<SignInResponse>> SendSignInEmailAdmin([FromBody] SignInRequest request)
        {
                await _botProtectionService.EnsureHumanVerifiedAsync(request.BotProtectionToken, "admin_signin_email", HttpContext.Connection.RemoteIpAddress?.ToString());
                var response = await _usersService.SendSignInEmailAdminAsync(request);
                return Ok(response);
        }

        [HttpPost("admin/signin-token")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-signin-token")]
        public async Task<ActionResult<AuthResponse>> SignInAdminToken([FromBody] SignInRequestToken request)
        {
                AuthResponse result = await _usersService.SignInAdminTokenAsync(request.Token);
                return Ok(result);
        }

        [HttpPost("admin/social/signin")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-social-signin")]
        public async Task<ActionResult<AuthResponse>> SignInAdminSocial([FromBody] SocialSignInRequest request)
        {
                await _botProtectionService.EnsureHumanVerifiedAsync(request.BotProtectionToken, "admin_social_signin", HttpContext.Connection.RemoteIpAddress?.ToString());
                var response = await _usersService.SignInAdminSocialAsync(request);
                return Ok(response);
        }

        [HttpGet("admin/social/google/oauth/start")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-social-signin")]
        public IActionResult StartGoogleOAuth([FromQuery] string? returnUrl)
        {
                var callbackUrl = BuildAbsoluteUrl("/users/admin/social/google/oauth/callback");
                var authorizeUrl = _usersService.BuildGoogleOAuthAuthorizeUrl(callbackUrl, returnUrl);
                return Redirect(authorizeUrl);
        }

        [HttpGet("admin/social/google/oauth/callback")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-social-signin")]
        public async Task<IActionResult> GoogleOAuthCallback([FromQuery] string? code, [FromQuery] string? state, [FromQuery] string? error)
        {
                var callbackUrl = BuildAbsoluteUrl("/users/admin/social/google/oauth/callback");
                var redirectUrl = await _usersService.HandleGoogleOAuthCallbackAsync(callbackUrl, code, state, error);
                return Redirect(redirectUrl);
        }

        [HttpPost("admin/social/google/oauth/complete")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-social-signin")]
        public async Task<ActionResult<AuthResponse>> CompleteGoogleOAuth([FromBody] GoogleOAuthCompleteRequest request)
        {
                var response = await _usersService.CompleteGoogleOAuthSignInAsync(request.Token);
                return Ok(response);
        }

        [HttpGet("admin/social/facebook/oauth/start")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-social-signin")]
        public IActionResult StartFacebookOAuth([FromQuery] string? returnUrl)
        {
                var callbackUrl = BuildAbsoluteUrl("/users/admin/social/facebook/oauth/callback");
                var authorizeUrl = _usersService.BuildFacebookOAuthAuthorizeUrl(callbackUrl, returnUrl);
                return Redirect(authorizeUrl);
        }

        [HttpGet("admin/social/facebook/oauth/callback")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-social-signin")]
        public async Task<IActionResult> FacebookOAuthCallback(
                [FromQuery] string? code,
                [FromQuery] string? state,
                [FromQuery] string? error,
                [FromQuery(Name = "error_reason")] string? errorReason,
                [FromQuery(Name = "error_description")] string? errorDescription)
        {
                var callbackUrl = BuildAbsoluteUrl("/users/admin/social/facebook/oauth/callback");
                var redirectUrl = await _usersService.HandleFacebookOAuthCallbackAsync(callbackUrl, code, state, error, errorReason, errorDescription);
                return Redirect(redirectUrl);
        }

        [HttpPost("admin/social/facebook/oauth/complete")]
        [AllowAnonymous]
        [EnableRateLimiting("admin-social-signin")]
        public async Task<ActionResult<AuthResponse>> CompleteFacebookOAuth([FromBody] GoogleOAuthCompleteRequest request)
        {
                var response = await _usersService.CompleteFacebookOAuthSignInAsync(request.Token);
                return Ok(response);
        }

        #endregion

        #region Participant Endpoints

        [HttpPost("participant/signup")]
        [AdminOnly]
        public async Task<ActionResult<AdminsParticipantDto>> SignUpParticipant([FromBody] SignUpParticipantRequest request)
        {
                AdminsParticipantDto result = await _usersService.SignUpParticipantAsync(request);
                return Ok(result);
        }

        [HttpPost("participant/signin")]
        [AllowAnonymous]
        [EnableRateLimiting("participant-signin")]
        public async Task<ActionResult<AuthResponse>> SignInParticipant([FromBody] SignInParticipantRequest request)
        {
                await _botProtectionService.EnsureHumanVerifiedAsync(request.BotProtectionToken, "participant_signin", HttpContext.Connection.RemoteIpAddress?.ToString());
                var response = await _usersService.SignInParticipantAsync(request);
                return Ok(response);
        }

        #endregion

        #region Temporary User Endpoints

        [HttpPost("create-temporary-user")]
        [AllowAnonymous]
        [EnableRateLimiting("temporary-user-create")]
        public async Task<ActionResult<CreateTemporaryUserResponse>> CreateTemporaryUser([FromBody] CreateTemporaryUserRequest request)
        {
                await _botProtectionService.EnsureHumanVerifiedAsync(request.BotProtectionToken, "temporary_user_create", HttpContext.Connection.RemoteIpAddress?.ToString());
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
        public async Task<ActionResult<object>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
                var response = await _usersService.UpdateProfileAsync(request);
                return Ok(response);
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
        [EnableRateLimiting("contact-submit")]
        public async Task<ActionResult<ContactSubmissionDto>> SubmitContact([FromBody] ContactSubmissionRequest request)
        {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var userAgent = Request.Headers["User-Agent"].ToString();
                var referrerUrl = Request.Headers["Referer"].ToString();

                _botProtectionService.EnsureHoneypotIsEmpty(request.Website, nameof(request.Website));
                await _botProtectionService.EnsureHumanVerifiedAsync(request.BotProtectionToken, "contact_submit", ipAddress);

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
        private string BuildAbsoluteUrl(string path)
        {
                var scheme = Request.Scheme;
                if (_environment.IsProduction() && !string.Equals(scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
                {
                        scheme = Uri.UriSchemeHttps;
                }

                return $"{scheme}://{Request.Host}{path}";
        }

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
        [EnableRateLimiting("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestDto request)
        {
                var result = await _usersService.RefreshTokenAsync(request);
                return Ok(result);
        }

        [HttpGet("is-user-temporary")]
        [EnableRateLimiting("is-user-temporary")]
        public async Task<ActionResult<bool>> IsUserTemporary([FromQuery] string email)
        {
                if (string.IsNullOrWhiteSpace(email))
                {
                        return BadRequest("Email is required");
                }

                var isTemporary = await _usersService.IsUserTemporary(email);
                return Ok(isTemporary);
        }

        [HttpPut("convert-temporary-user")]
        [AdminOnly]
        public async Task<IActionResult> ConvertTemporaryUser([FromBody] ConvertTemporaryUserRequest request)
        {
                await _usersService.ConvertTemporaryUserAsync(request.OldEmail, request.NewEmail);
                return Ok();
        }

        [HttpPost("send-participant-invitation")]
        [AdminOnly]
        public async Task<ActionResult> SendParticipantInvitation([FromBody] SendInvitationRequest request)
        {
                await _usersService.SendParticipantInvitationAsync(request.AdminParticipantId);
                return Ok();
        }

        [HttpGet("health-check")]
        [AllowAnonymous]
        public async Task<IActionResult> Get()
        {
                return Ok(new { status = "OK" });
        }

        [HttpGet("version")]
        [AllowAnonymous]
        public async Task<IActionResult> GetVersion()
        {
                string version = await _usersService.GetDbVersion();
                return Ok(new { db_version = version });
        }

        [HttpGet("client-settings")]
        [AllowAnonymous]
        public async Task<ActionResult<ClientSettingsDto>> GetClientSettings()
        {
                var settings = await _usersService.GetClientSettingsAsync();
                return Ok(settings);
        }
}

