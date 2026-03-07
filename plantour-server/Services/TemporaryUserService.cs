using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using plantour_server.DTOs;
using plantour_server.DbModels;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;
using plantour_server.Utils;
using plantour_server.Models;
using Microsoft.Extensions.Options;

namespace plantour_server.Services;

public class TemporaryUserService : ITemporaryUserService
{
    private readonly UsersRepository _usersRepository;
    private readonly ITokenService _tokenService;
    private readonly TripRepository _tripRepository;
    private readonly TripUserRepository _tripUserRepository;
    private readonly PackRepository _packRepository;
    private readonly ThingRepository _thingRepository;
    private readonly TripThingRepository _tripThingRepository;
    private readonly TripPackRepository _tripPackRepository;
    private readonly LookupsRepository _lookupsRepository;
    private readonly AdminsParticipantRepository _adminsParticipantRepository;
    private readonly PlantourContext _context;
    private readonly IMapper _mapper;
    private readonly IAccessRulesService _accessRulesService;
    private readonly AccessTypeRepository _accessTypeRepository;

    private readonly JwtSettings _jwtSettings;

    
    public TemporaryUserService(
        IOptions<JwtSettings> jwtSettings,
        UsersRepository usersRepository,
        ITokenService tokenService,
        TripRepository tripRepository,
        TripUserRepository tripUserRepository,
        PackRepository packRepository,
        ThingRepository thingRepository,
        TripThingRepository tripThingRepository,
        TripPackRepository tripPackRepository,
        LookupsRepository lookupsRepository,
        AdminsParticipantRepository adminsParticipantRepository,
        PlantourContext context,
        IMapper mapper,
        IAccessRulesService accessRulesService,
        AccessTypeRepository accessTypeRepository)
    {
        _jwtSettings = jwtSettings.Value;
        _usersRepository = usersRepository;
        _tokenService = tokenService;
        _tripRepository = tripRepository;
        _accessRulesService = accessRulesService;
        _tripUserRepository = tripUserRepository;
        _packRepository = packRepository;
        _thingRepository = thingRepository;
        _tripThingRepository = tripThingRepository;
        _accessTypeRepository = accessTypeRepository;
        _tripPackRepository = tripPackRepository;
        _lookupsRepository = lookupsRepository;
        _adminsParticipantRepository = adminsParticipantRepository;
        _context = context;
        _mapper = mapper;
    }

    public async Task<CreateTemporaryUserResponse> CreateTemporaryUserAsync()
    {
        // Generate unique email with counter from database
        string email;
        int counter;

        // Query all users with Robin.Miles pattern
        var existingUsers = await _context.Users
            .Where(u => u.Email.StartsWith("Robin.Miles") && u.Email.EndsWith("@plantour.app"))
            .Select(u => u.Email)
            .ToListAsync();

        // Extract counters and find maximum
        int maxCounter = 1272;
        foreach (var userEmail in existingUsers)
        {
            // Extract number from Robin.MilesXXXX@plantour.app
            var emailPrefix = userEmail.Replace("@plantour.app", "").Replace("Robin.Miles", "");
            if (int.TryParse(emailPrefix, out int existingCounter))
            {
                if (existingCounter > maxCounter)
                {
                    maxCounter = existingCounter;
                }
            }
        }

        // Increment counter and generate email
        counter = maxCounter + 1;
        email = $"Robin.Miles{counter:D4}@plantour.app";

        // Create temporary user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = "Robin",
            LastName = "Miles",
            CreatedAt = DateTime.UtcNow,
            Notes = "Automatically created temporary user",
            AccessTypeId = await _accessTypeRepository.GetActiveId(),
            Temporary = true
        };

        await _usersRepository.AddAsync(user);

        // Populate test data for the user
        Trip activeTrip = await PopulateSampleDataAsync(user);
        var accessTokenResult = await _tokenService.CreateAccessToken(user, UserRole.Admin, user.Id);

        var rules = accessTokenResult.Rules;

        return new CreateTemporaryUserResponse
        {
            AccessToken = accessTokenResult.Token,
            AccessTokenExpiresAtUtc = accessTokenResult.ExpiresAtUtc,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CurrentTripId = activeTrip.Id,
            TemporaryUserAccessTokenExpirationDays = _jwtSettings.TemporaryUserAccessTokenExpirationDays,
            ItemsLimit = rules.FirstOrDefault(r => r.Id == 40)?.Value ?? 0, 
            ParticipantsLimit = rules.FirstOrDefault(r => r.Id == 50)?.Value ?? 0, 
        };
    }

    private async Task<Trip> PopulateSampleDataAsync(User user)
    {
        // Create packages
        var packages = CreateSamplePackages(user);
        foreach (var package in packages)
        {
            await _packRepository.AddAsync(package);
        }

        // Create things with categories
        var things = CreateSampleThings(user);
        foreach (var thing in things)
        {
            await _thingRepository.AddAsync(thing);
        }

        // Create two trips: one past, one active
        var tripStatusCompleted = await GetTripStatus("Completed");
        var tripStatusActive = await GetTripStatus("Active");

        // Create past trip - "Week in Europe"
        var pastTrip = new Trip
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TripStatusId = tripStatusCompleted.Id,
            Name = "Week in Europe",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-24)),
            Notes = "Sample trip in the past"
        };
        await _tripRepository.AddAsync(pastTrip);

        // Create active trip - "Weekend in Las Vegas"
        var activeTrip = new Trip
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TripStatusId = tripStatusActive.Id,
            Name = "Weekend in Las Vegas",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)),
            Notes = "Sample active trip"
        };
        await _tripRepository.AddAsync(activeTrip);

        // Create AdminsParticipant for the temporary user (self-admin relationship)
        var adminParticipant = new AdminsParticipant
        {
            Id = Guid.NewGuid(),
            AdminId = user.Id,
            ParticipantId = user.Id,
            AccessCodeHash = GenerateAccessCodeHash(Guid.NewGuid().ToString()),
            Notes = "Temporary user admin access"
        };
        await _adminsParticipantRepository.AddAsync(adminParticipant);

        // Create TripUser entries for both trips
        var pastTripUser = new TripUser
        {
            Id = Guid.NewGuid(),
            TripId = pastTrip.Id,
            AdminParticipantId = adminParticipant.Id,
            Notes = "Demo participant"
        };
        await _tripUserRepository.AddAsync(pastTripUser);

        var activeTripUser = new TripUser
        {
            Id = Guid.NewGuid(),
            TripId = activeTrip.Id,
            AdminParticipantId = adminParticipant.Id,
            Notes = "Demo participant"
        };
        await _tripUserRepository.AddAsync(activeTripUser);

        // Populate past trip with packages and things (completed status)
        await PopulatePastTripAsync(pastTrip, pastTripUser, packages);

        // Populate active trip with packages and things (in progress)
        await PopulateActiveTripAsync(activeTrip, activeTripUser, packages);

        return activeTrip;
    }

    private async Task PopulatePastTripAsync(Trip trip, TripUser tripUser, List<UserPackage> packages)
    {
        // Add 2 packages and 5 things to the past trip (completed)
        var tripPackages = new List<TripUserPackage>();

        // Add first two packages
        for (int i = 0; i < 2; i++)
        {
            var tripPackage = new TripUserPackage
            {
                Id = Guid.NewGuid(),
                TripUserId = tripUser.Id,
                Name = packages[i].Name,
                Label = $"Bag {i + 1}",
                Notes = "Completed packing",
                PackingListIncluded = true
            };
            await _tripPackRepository.AddAsync(tripPackage);
            tripPackages.Add(tripPackage);
        }

        // Add 5 things to the past trip
        var pastTripThings = new List<TripUserThing>();
        var thingsToAdd = new[] { "Passport", "T-shirt", "Jeans", "Socks", "Camera" };
        var thingCategories = new[] { "documents", "clothing", "clothing", "clothing", "electronics" };

        for (int i = 0; i < thingsToAdd.Length; i++)
        {
            var tripThing = new TripUserThing
            {
                Id = Guid.NewGuid(),
                TripUserId = tripUser.Id,
                Name = thingsToAdd[i],
                Category = thingCategories[i],
                TripUserPackageId = i < 2 ? tripPackages[i].Id : tripPackages[0].Id,
                Finished = "success",
                FinishedAt = DateTime.UtcNow.AddDays(-10)
            };
            await _tripThingRepository.AddAsync(tripThing);
            pastTripThings.Add(tripThing);
        }
    }

    private async Task PopulateActiveTripAsync(Trip trip, TripUser tripUser, List<UserPackage> packages)
    {
        // Add 2 packages and 5 things to the active trip (in progress)
        var tripPackages = new List<TripUserPackage>();

        // Add first two packages
        for (int i = 0; i < 2; i++)
        {
            var tripPackage = new TripUserPackage
            {
                Id = Guid.NewGuid(),
                TripUserId = tripUser.Id,
                Name = packages[i].Name,
                Label = $"Bag {i + 1}",
                Notes = "Packing in progress",
                PackingListIncluded = false
            };
            await _tripPackRepository.AddAsync(tripPackage);
            tripPackages.Add(tripPackage);
        }

        // Add 5 things to the active trip
        var activeThings = new[] { "Passport", "Cash", "Hotel Reservation", "Sunscreen", "Phone Charger" };
        var activeThingCategories = new[] { "documents", "documents", "documents", "electronics", "electronics" };

        for (int i = 0; i < activeThings.Length; i++)
        {
            var tripThing = new TripUserThing
            {
                Id = Guid.NewGuid(),
                TripUserId = tripUser.Id,
                Name = activeThings[i],
                Category = activeThingCategories[i],
                TripUserPackageId = i < 2 ? tripPackages[i].Id : null,
                Finished = null
            };
            await _tripThingRepository.AddAsync(tripThing);
        }
    }

    private List<UserPackage> CreateSamplePackages(User user)
    {
        return new List<UserPackage>
        {
            new UserPackage { Id = Guid.NewGuid(), UserId = user.Id, Name = "Backpack", Notes = "Main backpack" },
            new UserPackage { Id = Guid.NewGuid(), UserId = user.Id, Name = "Daypack", Notes = "Day activities" },
            new UserPackage { Id = Guid.NewGuid(), UserId = user.Id, Name = "Toiletries Bag", Notes = "Personal items" }
        };
    }

    private List<UserThing> CreateSampleThings(User user)
    {
        var things = new List<UserThing>();

        // Clothing category - 7 items
        var clothingItems = new[] { "T-shirt", "Jeans", "Shorts", "Underwear", "Socks", "Light jacket", "Hat" };
        foreach (var item in clothingItems)
        {
            things.Add(new UserThing
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Name = item,
                Category = "Clothing",
                Shared = false
            });
        }

        // Electronics category - 7 items
        var electronicsItems = new[] { "Phone", "Phone Charger", "Headphones", "Camera", "USB Cable", "Power Bank", "Laptop" };
        foreach (var item in electronicsItems)
        {
            things.Add(new UserThing
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Name = item,
                Category = "Electronics",
                Shared = false
            });
        }

        // Documents category - 6 items
        var documentsItems = new[] { "Passport", "Travel Insurance", "Hotel SignIn", "Flight Ticket", "ID Card", "Vaccination Certificate" };
        foreach (var item in documentsItems)
        {
            things.Add(new UserThing
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Name = item,
                Category = "Documents",
                Shared = false
            });
        }

        return things;
    }

    private async Task<TripStatus> GetTripStatus(string statusName)
    {
        var status = await _context.TripStatuses
            .FirstOrDefaultAsync(ts => ts.Name == statusName);

        if (status == null)
        {
            throw new CustomException("Wrong trip status");
        }

        return status;
    }

    private string GenerateAccessCodeHash(string accessCode)
    {
        string pepper = Guid.NewGuid().ToString();
        string input = accessCode + pepper;
        byte[] bytes = Encoding.UTF8.GetBytes(input);
        byte[] hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}