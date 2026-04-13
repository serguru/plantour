using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using plantour_server.DbModels;
using plantour_server.Services.Interfaces;

namespace plantour_server.Repositories;

public class UsersRepository(
    PlantourContext context,
    SettingsRepository settingsRepository,
    IEmailService emailService,
    ILogger<UsersRepository> logger) : GenericRepository<User>(context)
{
    private readonly SettingsRepository _settingsRepository = settingsRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly ILogger<UsersRepository> _logger = logger;

    public override async Task<User> AddAsync(User entity)
    {
        var createdUser = await base.AddAsync(entity);

        try
        {
            var sendEmail = await _settingsRepository.GetSettingByKey("send_email_user_created") as bool?;
            if (sendEmail != true)
            {
                return createdUser;
            }

            var adminEmail = await _settingsRepository.GetSettingByKey("admin_email") as string;
            if (string.IsNullOrWhiteSpace(adminEmail))
            {
                // TODO LOG
                // _logger.LogWarning("Admin email setting is missing or empty; skipping new user notification for {UserId}", createdUser.Id);
                return createdUser;
            }

            var accessTypeName = await _context.AccessTypes
                .AsNoTracking()
                .Where(x => x.Id == createdUser.AccessTypeId)
                .Select(x => x.Name)
                .FirstOrDefaultAsync();

            var createdAt = createdUser.CreatedAt == default ? DateTime.UtcNow : createdUser.CreatedAt;

            await _emailService.SendUserCreatedNotificationEmailAsync(new UserCreatedNotificationEmailRequest(
                adminEmail,
                adminEmail,
                createdUser.Id,
                createdUser.Email,
                createdUser.FirstName,
                createdUser.LastName,
                createdUser.Phone,
                createdUser.Temporary,
                accessTypeName,
                createdAt,
                createdUser.Notes,
                createdUser.GoogleSub,
                createdUser.FacebookUserId,
                createdUser.ParticipantCode,
                createdUser.PaddleSubscriptionId));
        }
        catch (Exception)
        {
            // TODO LOG
            // _logger.LogError(ex, "Failed to send admin notification for newly created user {UserId}", createdUser.Id);
        }

        return createdUser;
    }


    public async Task<bool> ActiveUserExistsByIdAsync(Guid userId)
    {
        return await _dbSet
        .Include(x => x.AccessType)
        .AnyAsync(u => u.Id == userId && u.AccessType != null && u.AccessType.Name.ToLower() == "active");
    }

    public async Task<User?> GetActiveByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(x => x.AccessType)
            .FirstOrDefaultAsync(x => x.Id == id && x.AccessType != null && x.AccessType.Name.ToLower() == "active");
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(x => x.AccessType)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetActiveByEmailAsync(string email)
    {
        var user = await GetByEmailAsync(email);
        if (user != null && user.AccessType != null && user.AccessType.Name.ToLower() == "active")
        {
            return user;
        }
        return null;
    }

    public async Task<User?> GetByIdWithDetailsAsync(Guid userId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.AccessType)
            // .Include(x => x.PriceEnum)
            //     .ThenInclude(x => x != null ? x.Plan : null)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<User?> GetByGoogleSubAsync(string googleSub)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.AccessType)
            // .Include(x => x.PriceEnum)
            //     .ThenInclude(x => x != null ? x.Plan : null)
            .FirstOrDefaultAsync(u => u.GoogleSub != null && u.GoogleSub == googleSub);
    }

    public async Task<User?> GetByFacebookUserIdAsync(string facebookUserId)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(x => x.AccessType)
            // .Include(x => x.PriceEnum)
            //     .ThenInclude(x => x != null ? x.Plan : null)
            .FirstOrDefaultAsync(u => u.FacebookUserId != null && u.FacebookUserId == facebookUserId);
    }

}
