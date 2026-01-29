using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
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
    IMapper mapper) : IContactSubmissionService
{
    private readonly ContactSubmissionRepository _contactRepository = contactRepository;
    private readonly IMapper _mapper = mapper;

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
