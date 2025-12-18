using AutoMapper;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Repositories;

public class TripRepository : BaseRepository
{
    private readonly DbSet<Trip> _dbSet;
    private readonly PlantourContext _context;

    private readonly IMapper _mapper;

    public TripRepository(PlantourContext context, IHttpContextAccessor httpContextAccessor,
        IMapper mapper) : base(httpContextAccessor)
    {
        _dbSet = context.Set<Trip>();
        _context = context;
        _mapper = mapper;
    }

    public async Task<Trip?> GetByIdAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return null;
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUser.UserId);
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUser.AdminId && x.TripUsers.Any(y => y.Trip.UserId == CurrentUser.UserId));
        }

        return null;
    }
    public async Task<bool> AnyByIdAsync(Guid id)
    {
        if (CurrentUser == null)
        {
            return false;
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .AnyAsync(x => x.Id == id && x.UserId == CurrentUser.UserId);
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .AnyAsync(x => x.Id == id && x.UserId == CurrentUser.AdminId && x.TripUsers.Any(y => y.Trip.UserId == CurrentUser.UserId));
        }

        return false;
    }

    public async Task<IEnumerable<Trip>> GetAllForParticipantAsync()
    {
        if (CurrentUser == null)
        {
            return Array.Empty<Trip>();
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Where(x => 
                    x.UserId == CurrentUser.UserId && 
                    x.TripUsers.Any(y => 
                    y.AdminParticipant.ParticipantId == CurrentUser.UserId &&
                    y.AdminParticipant.AdminId == CurrentUser.UserId
                    ))
                .ToListAsync();
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .Where(x => 
                    x.UserId == CurrentUser.AdminId && 
                    x.TripUsers.Any(y => 
                    y.AdminParticipant.ParticipantId == CurrentUser.UserId &&
                    y.AdminParticipant.AdminId == CurrentUser.AdminId
                    ))
                .ToListAsync();
        }

        return Array.Empty<Trip>();

    }

    public async Task<IEnumerable<Trip>> GetAllAsync()
    {
        if (CurrentUser == null)
        {
            return Array.Empty<Trip>();
        }

        if (CurrentUser.IsAdmin)
        {
            return await _dbSet
                .Where(x => x.UserId == CurrentUser.UserId)
                .ToListAsync();
        }

        if (CurrentUser.IsParticipant)
        {
            return await _dbSet
                .Include(x => x.TripUsers)
                .Where(x => x.UserId == CurrentUser.AdminId && x.TripUsers.Any(y => y.Trip.UserId == CurrentUser.UserId))
                .ToListAsync();
        }

        return Array.Empty<Trip>();

    }

    public async Task AddAsync(Trip entity)
    {
        if (CurrentUser == null || !CurrentUser.IsAdmin)
        {
            throw new InvalidOperationException("Access denied");
        }

        entity.Id = Guid.NewGuid();
        entity.UserId = CurrentUser!.UserId!.Value;
        _context.Trips.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Trip entity)
    {
        if (CurrentUser == null || !CurrentUser.IsAdmin)
        {
            throw new InvalidOperationException("Access denied");
        }
        var existingEntity = await GetByIdAsync(entity.Id);
        if (existingEntity == null)
        {
            throw new InvalidOperationException("Trip not found");
        }
        _context.Trips.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (CurrentUser == null || !CurrentUser.IsAdmin)
        {
            throw new InvalidOperationException("Access denied");
        }
        var entity = await GetByIdAsync(id);
        if (entity == null)
        {
            return;
        }
        _context.Trips.Remove(entity);
        await _context.SaveChangesAsync();
    }

    public async Task<TripStatDto?> GetTripStats(Guid id)
    {
        if (!await AnyByIdAsync(id))
        {
            return null;
        }

        TripStatDto? result =
            _dbSet
            .Include(x => x.TripUsers)
            .ThenInclude(x => x.TripUserPackages)
            .ThenInclude(x => x.TripUserThings)
            .Select(x => new TripStatDto
            {
                Trip = new TripDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    TripStatusId = x.TripStatusId,
                    TripStatus = x.TripStatus.Name,
                    Name = x.Name,
                    Notes = x.Notes,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate
                },
                TotalDays = (x.EndDate.HasValue && x.StartDate.HasValue) ? (x.EndDate.Value.DayNumber - x.StartDate.Value.DayNumber + 1) : 0,
                TotalParticipants = x.TripUsers.Count,     
                TotalPacks = x.TripUsers.Sum(tu => tu.TripUserPackages.Count),
                TotalThings = x.TripUsers.Sum(tu => tu.TripUserPackages.Sum(tp => tp.TripUserThings.Count))
            })
            .FirstOrDefault(x => x.Trip.Id == id);

        return result;
    }

}
