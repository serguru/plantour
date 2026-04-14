using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Logging;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using AutoMapper;

namespace plantour_server.Services;

public interface IContactSubmissionService
{
    Task<ContactSubmissionDto> SubmitContactAsync(ContactSubmissionRequest request, string? ipAddress, string? userAgent, string? referrerUrl);
    Task<IEnumerable<ContactSubmissionDto>> GetRecentSubmissionsAsync(int days = 30);
    Task<IEnumerable<ContactSubmissionDto>> GetByStatusAsync(string status);
}

public class ContactSubmissionService(
    ContactSubmissionRepository contactRepository,
    SettingsRepository settingsRepository,
    IEmailService emailService,
    IMapper mapper,
    IPlantourLogger logger) : IContactSubmissionService
{
    private readonly ContactSubmissionRepository _contactRepository = contactRepository;
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly IMapper _mapper = mapper;
    private readonly IPlantourLogger _logger = logger;

    public async Task<ContactSubmissionDto> SubmitContactAsync(ContactSubmissionRequest request, string? ipAddress, string? userAgent, string? referrerUrl)
    {
        var submission = new ContactSubmission
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            SubjectCategory = request.SubjectCategory,
            MessageBody = request.MessageBody,
            ContactStatus = "new",
            IpAddress = !string.IsNullOrEmpty(ipAddress) ? System.Net.IPAddress.Parse(ipAddress) : null,
            UserAgent = userAgent,
            ReferrerUrl = referrerUrl,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _contactRepository.AddAsync(submission);

        try
        {
            var supportEmail = await _settingsRepository.GetSettingByKey("support_email") as string;
            if (string.IsNullOrWhiteSpace(supportEmail))
            {
                 _logger.LogWarning($"Support email setting is missing or empty; skipping contact submission notification for {request.Email}");
            }
            else
            {
                await _emailService.SendContactSubmissionNotificationEmailAsync(new ContactSubmissionNotificationEmailRequest(
                    supportEmail,
                    supportEmail,
                    request.FullName,
                    request.Email,
                    request.PhoneNumber,
                    request.SubjectCategory,
                    request.MessageBody,
                    submission.CreatedAt,
                    ipAddress,
                    userAgent,
                    referrerUrl));
            }
        }
        catch (Exception)
        {
            _logger.LogError($"Failed to send support notification for contact submission {submission.Id}");
        }

        return _mapper.Map<ContactSubmissionDto>(result);
    }

    public async Task<IEnumerable<ContactSubmissionDto>> GetRecentSubmissionsAsync(int days = 30)
    {
        var submissions = await _contactRepository.GetAllRecentAsync(days);
        return _mapper.Map<IEnumerable<ContactSubmissionDto>>(submissions);
    }

    public async Task<IEnumerable<ContactSubmissionDto>> GetByStatusAsync(string status)
    {
        var submissions = await _contactRepository.GetByStatusAsync(status);
        return _mapper.Map<IEnumerable<ContactSubmissionDto>>(submissions);
    }
}
