using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Models;
using plantour_maintenance_server.Services.Interfaces;

namespace plantour_maintenance_server.Services;

public sealed class PlantourUsersService(
    PlantourContext context,
    HttpClient httpClient,
    IMemoryCache memoryCache,
    IOptions<StripeSettings> stripeSettingsOptions) : IPlantourUsersService
{
    private const int StripePageSize = 100;
    private static readonly TimeSpan StripeSnapshotCacheDuration = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan StripeSnapshotRequestTimeout = TimeSpan.FromSeconds(12);

    private readonly PlantourContext _context = context;
    private readonly HttpClient _httpClient = httpClient;
    private readonly IMemoryCache _memoryCache = memoryCache;
    private readonly StripeSettings _stripeSettings = stripeSettingsOptions.Value;

    public async Task<IReadOnlyList<PlantourUserRowDto>> GetAllAsync(
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        CancellationToken cancellationToken = default)
    {
        var usersQuery = _context.Users
            .AsNoTracking()
            .AsQueryable();

        if (from.HasValue && to.HasValue)
        {
            var fromUtc = from.Value.UtcDateTime;
            var toUtc = to.Value.UtcDateTime;

            usersQuery = usersQuery.Where(user => user.CreatedAt >= fromUtc && user.CreatedAt <= toUtc);
        }

        var users = await usersQuery
            .OrderByDescending(user => user.CreatedAt)
            .ThenBy(user => user.Email)
            .Select(user => new LocalUserRecord(
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.AccessType.Name,
                user.PaymentProcessorSubscriptionId,
                user.Temporary,
                user.CreatedAt,
                user.AdminsParticipantParticipants.Count()))
            .ToListAsync(cancellationToken);

        var ownedTripPairs = await _context.Trips
            .AsNoTracking()
            .Select(trip => new UserTripPair(trip.UserId, trip.Id))
            .ToListAsync(cancellationToken);

        var participantTripPairs = await _context.TripUsers
            .AsNoTracking()
            .Select(tripUser => new UserTripPair(tripUser.AdminParticipant.ParticipantId, tripUser.TripId))
            .ToListAsync(cancellationToken);

        var userThingCounts = await _context.UserThings
            .AsNoTracking()
            .GroupBy(item => item.UserId)
            .Select(group => new CountRecord(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        var tripThingCounts = await _context.TripUserThings
            .AsNoTracking()
            .GroupBy(item => item.TripUser.AdminParticipant.ParticipantId)
            .Select(group => new CountRecord(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        var userTodoCounts = await _context.UserTodos
            .AsNoTracking()
            .GroupBy(item => item.UserId)
            .Select(group => new CountRecord(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        var tripTodoCounts = await _context.TripUserTodos
            .AsNoTracking()
            .GroupBy(item => item.TripUser.AdminParticipant.ParticipantId)
            .Select(group => new CountRecord(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        var expenseCounts = await _context.TripUserExpenses
            .AsNoTracking()
            .GroupBy(item => item.TripUser.AdminParticipant.ParticipantId)
            .Select(group => new CountRecord(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        var travelerCounts = await _context.AdminsParticipants
            .AsNoTracking()
            .GroupBy(link => link.AdminId)
            .Select(group => new CountRecord(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        var lastVisitLookup = await _context.ApiVisits
            .AsNoTracking()
            .Where(visit => visit.UserId != null)
            .GroupBy(visit => visit.UserId!.Value)
            .Select(group => new DateRecord(group.Key, group.Max(visit => visit.CreatedAt)))
            .ToListAsync(cancellationToken);

        var tripCountsByUserId = ownedTripPairs
            .Concat(participantTripPairs)
            .GroupBy(pair => pair.UserId)
            .ToDictionary(
                group => group.Key,
                group => group.Select(item => item.TripId).Distinct().Count());

        var itemCountsByUserId = CombineCounts(userThingCounts, tripThingCounts);
        var todoCountsByUserId = CombineCounts(userTodoCounts, tripTodoCounts);
        var expenseCountsByUserId = expenseCounts.ToDictionary(item => item.UserId, item => item.Count);
        var travelerCountsByUserId = travelerCounts.ToDictionary(item => item.UserId, item => item.Count);
        var lastVisitByUserId = lastVisitLookup.ToDictionary(item => item.UserId, item => item.Value);

        var normalizedEmails = users
            .Select(user => NormalizeEmail(user.Email))
            .Where(email => !string.IsNullOrWhiteSpace(email))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(email => email, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var linkedSubscriptionIds = users
            .Select(user => user.PaymentProcessorSubscriptionId?.Trim())
            .Where(subscriptionId => !string.IsNullOrWhiteSpace(subscriptionId))
            .Cast<string>()
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(subscriptionId => subscriptionId, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var stripeSnapshot = await GetStripeSnapshotAsync(normalizedEmails, linkedSubscriptionIds, cancellationToken);

        return users.Select(user =>
        {
            CustomerSubscriptionSummary? subscriptionSummary = null;
            PaymentSummary? paymentSummary = null;
            StripeCustomerRecord? stripeCustomer = null;

            if (!string.IsNullOrWhiteSpace(user.PaymentProcessorSubscriptionId) &&
                stripeSnapshot.SubscriptionsBySubscriptionId.TryGetValue(user.PaymentProcessorSubscriptionId, out var linkedSubscription))
            {
                stripeSnapshot.CustomersById.TryGetValue(linkedSubscription.CustomerId, out stripeCustomer);
                stripeSnapshot.SubscriptionsByCustomerId.TryGetValue(linkedSubscription.CustomerId, out subscriptionSummary);
                stripeSnapshot.PaymentsByCustomerId.TryGetValue(linkedSubscription.CustomerId, out paymentSummary);
            }

            if (stripeCustomer == null)
            {
                stripeSnapshot.CustomersByEmail.TryGetValue(NormalizeEmail(user.Email), out stripeCustomer);

                if (stripeCustomer != null)
                {
                    stripeSnapshot.SubscriptionsByCustomerId.TryGetValue(stripeCustomer.Id, out subscriptionSummary);
                    stripeSnapshot.PaymentsByCustomerId.TryGetValue(stripeCustomer.Id, out paymentSummary);
                }
            }

            return new PlantourUserRowDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = BuildFullName(user.FirstName, user.LastName),
                Role = BuildRole(user.AccessTypeName, user.ParticipantAdminLinks),
                Plan = subscriptionSummary?.DisplayPlanName,
                StripeCustomerId = stripeCustomer?.Id,
                StripeCustomerStatus = stripeCustomer?.Status,
                StripeSubscriptionId = subscriptionSummary?.SubscriptionId,
                StripeSubscriptionStatus = subscriptionSummary?.SubscriptionStatus,
                StripePriceId = subscriptionSummary?.PriceId,
                Temporary = user.Temporary,
                DateJoined = user.DateJoined,
                HasActiveSubscription = subscriptionSummary?.HasActiveSubscription ?? false,
                LatestPlanStartedAt = subscriptionSummary?.LatestPlanStartedAt,
                LastVisitAt = lastVisitByUserId.GetValueOrDefault(user.Id),
                TripsCount = tripCountsByUserId.GetValueOrDefault(user.Id),
                ItemsCount = itemCountsByUserId.GetValueOrDefault(user.Id),
                TodosCount = todoCountsByUserId.GetValueOrDefault(user.Id),
                ExpensesCount = expenseCountsByUserId.GetValueOrDefault(user.Id),
                TravelersCount = travelerCountsByUserId.GetValueOrDefault(user.Id),
                PaymentsTotal = paymentSummary?.DisplayTotal
            };
        }).ToList();

        Dictionary<Guid, int> CombineCounts(IReadOnlyList<CountRecord> first, IReadOnlyList<CountRecord> second)
        {
            var result = new Dictionary<Guid, int>();

            foreach (var count in first.Concat(second))
            {
                result[count.UserId] = result.GetValueOrDefault(count.UserId) + count.Count;
            }

            return result;
        }

        string BuildRole(string accessTypeName, int participantAdminLinks)
        {
            if (string.Equals(accessTypeName, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return "Admin";
            }

            return participantAdminLinks > 0 ? "Participant/Admin" : accessTypeName;
        }
    }

    public async Task<ComprehensiveUserDto> GetComprehensiveDataAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.AccessType)
            .Include(u => u.Currency)
            .Include(u => u.UserSettings)
            .Include(u => u.UserKeys)
            .Include(u => u.UserThings)
            .Include(u => u.UserTodos)
            .Include(u => u.UserPackages)
            .Include(u => u.AdminsParticipantAdmins)
            .Include(u => u.AdminsParticipantParticipants)
            .Include(u => u.AiPrompts)
            .Include(u => u.AiTripPlans)
            .Include(u => u.RefreshTokens)
            .Include(u => u.Trips)
            .Include(u => u.AiPromptCheck)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User not found.", "USER_NOT_FOUND");
        }

        // Load indirect relationships
        var tripUsers = await _context.TripUsers
            .AsNoTracking()
            .Include(tu => tu.AdminParticipant)
            .Include(tu => tu.TripUserThings)
            .Include(tu => tu.TripUserTodos)
            .Include(tu => tu.TripUserExpenseTripUsers)
            .Include(tu => tu.TripUserPackages)
            .Where(tu => tu.AdminParticipant.ParticipantId == userId || tu.AdminParticipant.AdminId == userId)
            .ToListAsync(cancellationToken);

        var apiVisits = await _context.ApiVisits
            .AsNoTracking()
            .Where(av => av.UserId == userId)
            .ToListAsync(cancellationToken);

        // ContactSubmissions don't have UserId, skip them
        var contactSubmissions = Array.Empty<object>();

        // Extract collections for the DTO
        var tripUserThings = tripUsers.SelectMany(tu => tu.TripUserThings).ToList();
        var tripUserTodos = tripUsers.SelectMany(tu => tu.TripUserTodos).ToList();
        var tripUserExpenses = tripUsers.SelectMany(tu => tu.TripUserExpenseTripUsers).ToList();
        var tripUserPackages = tripUsers.SelectMany(tu => tu.TripUserPackages).ToList();

        // Helper function to convert entities to serializable objects
        object[] ToObjectArray<T>(IEnumerable<T>? collection) where T : class
        {
            if (collection == null)
                return Array.Empty<object>();
            
            return collection
                .Select(item => (object)item)
                .ToArray();
        }

        return new ComprehensiveUserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Phone = user.Phone,
            GoogleSub = user.GoogleSub,
            FacebookUserId = user.FacebookUserId,
            Notes = user.Notes,
            CreatedAt = user.CreatedAt,
            Temporary = user.Temporary,
            ParticipantCode = user.ParticipantCode,
            PaymentProcessorSubscriptionId = user.PaymentProcessorSubscriptionId,
            AccessTypeId = user.AccessTypeId,
            CurrencyId = user.CurrencyId,
            
            // Convert collections to object arrays for JSON serialization
            UserSettings = ToObjectArray(user.UserSettings),
            UserKeys = ToObjectArray(user.UserKeys),
            UserThings = ToObjectArray(user.UserThings),
            UserTodos = ToObjectArray(user.UserTodos),
            UserPackages = ToObjectArray(user.UserPackages),
            AdminsParticipantAdmins = ToObjectArray(user.AdminsParticipantAdmins),
            AdminsParticipantParticipants = ToObjectArray(user.AdminsParticipantParticipants),
            AiPrompts = ToObjectArray(user.AiPrompts),
            AiTripPlans = ToObjectArray(user.AiTripPlans),
            RefreshTokens = ToObjectArray(user.RefreshTokens),
            Trips = ToObjectArray(user.Trips),
            
            TripUsers = ToObjectArray(tripUsers),
            TripUserThings = ToObjectArray(tripUserThings),
            TripUserTodos = ToObjectArray(tripUserTodos),
            TripUserExpenses = ToObjectArray(tripUserExpenses),
            TripUserPackages = ToObjectArray(tripUserPackages),
            
            ApiVisits = ToObjectArray(apiVisits),
            ContactSubmissions = contactSubmissions,
            
            TotalTripsCount = (user.Trips?.Count ?? 0) + (tripUsers?.Select(tu => tu.TripId).Distinct().Count() ?? 0),
            TotalThingsCount = (user.UserThings?.Count ?? 0) + (tripUserThings?.Count ?? 0),
            TotalTodosCount = (user.UserTodos?.Count ?? 0) + (tripUserTodos?.Count ?? 0),
            TotalExpensesCount = tripUserExpenses?.Count ?? 0,
            TotalPackagesCount = (user.UserPackages?.Count ?? 0) + (tripUserPackages?.Count ?? 0)
        };
    }

    private async Task<StripeSnapshot> GetStripeSnapshotAsync(
        IReadOnlyList<string> normalizedEmails,
        IReadOnlyList<string> linkedSubscriptionIds,
        CancellationToken cancellationToken)
    {
        if (normalizedEmails.Count == 0 && linkedSubscriptionIds.Count == 0)
        {
            return StripeSnapshot.Empty;
        }

        var cacheKey = BuildStripeSnapshotCacheKey(normalizedEmails, linkedSubscriptionIds);

        if (_memoryCache.TryGetValue<StripeSnapshot>(cacheKey, out var cachedSnapshot) && cachedSnapshot != null)
        {
            return cachedSnapshot;
        }

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(StripeSnapshotRequestTimeout);

        try
        {
            var customersByEmailGroup = await GetCustomersByEmailAsync(normalizedEmails, timeoutCts.Token);
            var subscriptionsBySubscriptionId = await GetSubscriptionsByIdAsync(linkedSubscriptionIds, timeoutCts.Token);
            var customerIds = customersByEmailGroup.Values
                .SelectMany(group => group)
                .Select(customer => customer.Id)
                .Concat(subscriptionsBySubscriptionId.Values.Select(subscription => subscription.CustomerId))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var subscriptionsByCustomerId = await GetSubscriptionsByCustomerIdAsync(customerIds, timeoutCts.Token);
            var paymentsByCustomerId = await GetPaymentsByCustomerIdAsync(customerIds, timeoutCts.Token);
            var customersById = await GetCustomersByIdAsync(customersByEmailGroup, customerIds, timeoutCts.Token);
            var customersByEmail = customersByEmailGroup.ToDictionary(
                item => item.Key,
                item => SelectPreferredCustomer(item.Value, subscriptionsByCustomerId),
                StringComparer.OrdinalIgnoreCase);

            var snapshot = new StripeSnapshot(customersByEmail, customersById, subscriptionsByCustomerId, subscriptionsBySubscriptionId, paymentsByCustomerId);
            _memoryCache.Set(cacheKey, snapshot, StripeSnapshotCacheDuration);
            return snapshot;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new CustomException("Stripe request timed out while loading maintenance users.", "STRIPE_REQUEST_TIMEOUT");
        }
        catch (Exception)
        {
            throw;
        }
    }

    private async Task<Dictionary<string, StripeCustomerRecord>> GetCustomersByIdAsync(
        IReadOnlyDictionary<string, List<StripeCustomerRecord>> customersByEmailGroup,
        IReadOnlyList<string> customerIds,
        CancellationToken cancellationToken)
    {
        var result = customersByEmailGroup.Values
            .SelectMany(group => group)
            .GroupBy(customer => customer.Id, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.OrderByDescending(customer => customer.CreatedAt).First(), StringComparer.OrdinalIgnoreCase);

        foreach (var customerId in customerIds)
        {
            if (result.ContainsKey(customerId))
            {
                continue;
            }

            var customer = await GetStripeObjectAsync($"customers/{Uri.EscapeDataString(customerId)}", cancellationToken);
            if (customer == null)
            {
                continue;
            }

            result[customerId] = new StripeCustomerRecord(
                customerId,
                TryGetString(customer.Value, "email", out var email) ? NormalizeEmail(email) : string.Empty,
                "active",
                TryGetUnixDateTime(customer.Value, "created") ?? DateTime.MinValue);
        }

        return result;
    }

    private async Task<Dictionary<string, SubscriptionRecord>> GetSubscriptionsByIdAsync(
        IReadOnlyList<string> subscriptionIds,
        CancellationToken cancellationToken)
    {
        var result = new Dictionary<string, SubscriptionRecord>(StringComparer.OrdinalIgnoreCase);

        foreach (var subscriptionId in subscriptionIds)
        {
            var subscription = await GetStripeObjectAsync($"subscriptions/{Uri.EscapeDataString(subscriptionId)}", cancellationToken);
            if (subscription == null)
            {
                continue;
            }

            if (!TryGetObjectId(subscription.Value, "customer", out var customerId) || string.IsNullOrWhiteSpace(customerId))
            {
                continue;
            }

            var status = TryGetString(subscription.Value, "status", out var statusValue) ? statusValue : null;
            var startedAt = TryGetUnixDateTime(subscription.Value, "start_date");
            var createdAt = TryGetUnixDateTime(subscription.Value, "created");
            var billingPeriodEnd = TryGetSubscriptionCurrentPeriodEnd(subscription.Value);
            var priceId = TryGetFirstSubscriptionPriceId(subscription.Value);

            result[subscriptionId] = new SubscriptionRecord(subscriptionId, customerId, status, startedAt, createdAt, billingPeriodEnd, priceId);
        }

        return result;
    }

    private async Task<Dictionary<string, List<StripeCustomerRecord>>> GetCustomersByEmailAsync(
        IReadOnlyList<string> normalizedEmails,
        CancellationToken cancellationToken)
    {
        var emailSet = normalizedEmails.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var result = new Dictionary<string, List<StripeCustomerRecord>>(StringComparer.OrdinalIgnoreCase);
        var customers = await GetAllStripeEntitiesAsync($"customers?limit={StripePageSize}", cancellationToken);

        foreach (var customer in customers)
        {
            if (!TryGetString(customer, "email", out var email) || string.IsNullOrWhiteSpace(email))
            {
                continue;
            }

            var normalizedEmail = NormalizeEmail(email);
            if (!emailSet.Contains(normalizedEmail))
            {
                continue;
            }

            if (!TryGetString(customer, "id", out var id) || string.IsNullOrWhiteSpace(id))
            {
                continue;
            }

            var nextRecord = new StripeCustomerRecord(
                id,
                normalizedEmail,
                "active",
                TryGetUnixDateTime(customer, "created") ?? DateTime.MinValue);

            if (!result.TryGetValue(normalizedEmail, out var existingRecords))
            {
                existingRecords = [];
                result[normalizedEmail] = existingRecords;
            }

            existingRecords.Add(nextRecord);
        }

        return result;
    }

    private async Task<Dictionary<string, CustomerSubscriptionSummary>> GetSubscriptionsByCustomerIdAsync(
        IReadOnlyList<string> customerIds,
        CancellationToken cancellationToken)
    {
        if (customerIds.Count == 0)
        {
            return new Dictionary<string, CustomerSubscriptionSummary>(StringComparer.OrdinalIgnoreCase);
        }

        var customerIdSet = customerIds.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var grouped = new Dictionary<string, List<SubscriptionRecord>>(StringComparer.OrdinalIgnoreCase);

        var subscriptions = await GetAllStripeEntitiesAsync($"subscriptions?status=all&limit={StripePageSize}", cancellationToken);

        foreach (var subscription in subscriptions)
        {
            if (!TryGetObjectId(subscription, "customer", out var customerId) ||
                string.IsNullOrWhiteSpace(customerId) ||
                !customerIdSet.Contains(customerId))
            {
                continue;
            }

            if (!TryGetString(subscription, "id", out var subscriptionId) || string.IsNullOrWhiteSpace(subscriptionId))
            {
                continue;
            }

            var status = TryGetString(subscription, "status", out var statusValue) ? statusValue : null;
            var startedAt = TryGetUnixDateTime(subscription, "start_date");
            var createdAt = TryGetUnixDateTime(subscription, "created");
            var billingPeriodEnd = TryGetSubscriptionCurrentPeriodEnd(subscription);
            var priceId = TryGetFirstSubscriptionPriceId(subscription);

            if (!grouped.TryGetValue(customerId, out var customerSubscriptions))
            {
                customerSubscriptions = [];
                grouped[customerId] = customerSubscriptions;
            }

            customerSubscriptions.Add(new SubscriptionRecord(subscriptionId, customerId, status, startedAt, createdAt, billingPeriodEnd, priceId));
        }

        var planNamesByPriceId = await _context.Prices
            .AsNoTracking()
            .Where(price => price.PaymentProcessorPriceId != null)
            .Select(price => new PlanPriceRecord(price.PaymentProcessorPriceId!, price.Plan.Name))
            .ToDictionaryAsync(item => item.PriceId, item => item.PlanName, StringComparer.OrdinalIgnoreCase, cancellationToken);

        return grouped.ToDictionary(
            item => item.Key,
            item => BuildSubscriptionSummary(item.Value, planNamesByPriceId),
            StringComparer.OrdinalIgnoreCase);
    }

    private static CustomerSubscriptionSummary BuildSubscriptionSummary(
        IReadOnlyList<SubscriptionRecord> subscriptions,
        IReadOnlyDictionary<string, string> planNamesByPriceId)
    {
        if (subscriptions.Count == 0)
        {
            return new CustomerSubscriptionSummary(false, null, null, null, null, null);
        }

        var ordered = subscriptions
            .OrderByDescending(item => GetSortDate(item.BillingPeriodEnd, item.StartedAt, item.CreatedAt))
            .ToList();

        var activeSubscription = ordered.FirstOrDefault(item => IsAccessibleSubscription(item.Status, item.BillingPeriodEnd));
        var latestSubscription = ordered[0];
        var planSource = activeSubscription ?? latestSubscription;

        string? planName = null;
        if (!string.IsNullOrWhiteSpace(planSource.PriceId))
        {
            planNamesByPriceId.TryGetValue(planSource.PriceId, out planName);
        }

        return new CustomerSubscriptionSummary(
            activeSubscription != null,
            latestSubscription.StartedAt ?? latestSubscription.CreatedAt,
            planName,
            planSource.Id,
            planSource.Status,
            planSource.PriceId);
    }

    private async Task<Dictionary<string, PaymentSummary>> GetPaymentsByCustomerIdAsync(
        IReadOnlyList<string> customerIds,
        CancellationToken cancellationToken)
    {
        if (customerIds.Count == 0)
        {
            return new Dictionary<string, PaymentSummary>(StringComparer.OrdinalIgnoreCase);
        }

        var customerIdSet = customerIds.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var totalsByCustomerId = new Dictionary<string, Dictionary<string, decimal>>(StringComparer.OrdinalIgnoreCase);

        var invoices = await GetAllStripeEntitiesAsync($"invoices?status=paid&limit={StripePageSize}", cancellationToken);

        foreach (var invoice in invoices)
        {
            if (!TryGetObjectId(invoice, "customer", out var customerId) ||
                string.IsNullOrWhiteSpace(customerId) ||
                !customerIdSet.Contains(customerId))
            {
                continue;
            }

            var currencyCode = TryGetString(invoice, "currency", out var code) && !string.IsNullOrWhiteSpace(code)
                ? code.ToUpperInvariant()
                : "UNKNOWN";
            var paidMinorUnits = TryGetDecimal(invoice, "amount_paid");

            if (!paidMinorUnits.HasValue || paidMinorUnits.Value <= 0)
            {
                continue;
            }

            if (!totalsByCustomerId.TryGetValue(customerId, out var currencyTotals))
            {
                currencyTotals = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
                totalsByCustomerId[customerId] = currencyTotals;
            }

            currencyTotals[currencyCode] = currencyTotals.GetValueOrDefault(currencyCode) + paidMinorUnits.Value;
        }

        return totalsByCustomerId.ToDictionary(
            item => item.Key,
            item => new PaymentSummary(FormatCurrencyTotals(item.Value)),
            StringComparer.OrdinalIgnoreCase);
    }

    private async Task<List<JsonElement>> GetAllStripeEntitiesAsync(string path, CancellationToken cancellationToken)
    {
        EnsureStripeConfigured();

        if (_httpClient.BaseAddress == null)
        {
            _httpClient.BaseAddress = new Uri(_stripeSettings.ApiBaseUrl!, UriKind.Absolute);
        }

        var result = new List<JsonElement>();
        string? nextStartingAfter = null;

        while (true)
        {
            var requestPath = path;
            if (!string.IsNullOrWhiteSpace(nextStartingAfter))
            {
                requestPath += requestPath.Contains('?', StringComparison.Ordinal) ? "&" : "?";
                requestPath += $"starting_after={Uri.EscapeDataString(nextStartingAfter)}";
            }

            using var request = new HttpRequestMessage(HttpMethod.Get, requestPath);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _stripeSettings.ApiKey);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            using var response = await SendStripeRequestWithRetryAsync(request, cancellationToken);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return result;
            }

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new CustomException($"Stripe request failed with {(int)response.StatusCode}: {body}", "STRIPE_REQUEST_FAILED");
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            if (!document.RootElement.TryGetProperty("data", out var dataElement) || dataElement.ValueKind != JsonValueKind.Array)
            {
                throw new CustomException("Stripe response does not contain an array data property.", "STRIPE_INVALID_RESPONSE");
            }

            var page = dataElement.EnumerateArray().Select(item => item.Clone()).ToList();
            result.AddRange(page);

            var hasMore = document.RootElement.TryGetProperty("has_more", out var hasMoreElement) &&
                hasMoreElement.ValueKind == JsonValueKind.True;

            if (!hasMore || page.Count == 0)
            {
                return result;
            }

            nextStartingAfter = GetRequiredString(page[^1], "id", "Stripe list item does not contain id");
        }
    }

    private async Task<JsonElement?> GetStripeObjectAsync(string path, CancellationToken cancellationToken)
    {
        EnsureStripeConfigured();

        if (_httpClient.BaseAddress == null)
        {
            _httpClient.BaseAddress = new Uri(_stripeSettings.ApiBaseUrl!, UriKind.Absolute);
        }

        using var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _stripeSettings.ApiKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await SendStripeRequestWithRetryAsync(request, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new CustomException($"Stripe request failed with {(int)response.StatusCode}: {body}", "STRIPE_REQUEST_FAILED");
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        return document.RootElement.Clone();
    }

    private async Task<HttpResponseMessage> SendStripeRequestWithRetryAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var response = await _httpClient.SendAsync(CloneRequest(request), cancellationToken);

        if (response.StatusCode != System.Net.HttpStatusCode.TooManyRequests)
        {
            return response;
        }

        var retryDelay = TimeSpan.FromSeconds(5);
        if (response.Headers.RetryAfter?.Delta != null)
        {
            retryDelay = response.Headers.RetryAfter.Delta.Value;
        }
        else if (response.Headers.RetryAfter?.Date != null)
        {
            var delay = response.Headers.RetryAfter.Date.Value - DateTimeOffset.UtcNow;
            if (delay > TimeSpan.Zero)
            {
                retryDelay = delay;
            }
        }

        response.Dispose();

        await Task.Delay(retryDelay, cancellationToken);
        return await _httpClient.SendAsync(CloneRequest(request), cancellationToken);
    }

    private void EnsureStripeConfigured()
    {
        if (string.IsNullOrWhiteSpace(_stripeSettings.ApiBaseUrl) || string.IsNullOrWhiteSpace(_stripeSettings.ApiKey))
        {
            throw new CustomException("StripeSettings ApiBaseUrl and ApiKey must both be configured for maintenance users.", "STRIPE_SETTINGS_MISSING");
        }
    }

    private static string BuildFullName(string? firstName, string? lastName)
    {
        var fullName = string.Join(' ', new[] { firstName?.Trim(), lastName?.Trim() }.Where(value => !string.IsNullOrWhiteSpace(value)));
        return string.IsNullOrWhiteSpace(fullName) ? string.Empty : fullName;
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static string BuildStripeSnapshotCacheKey(
        IReadOnlyList<string> normalizedEmails,
        IReadOnlyList<string> linkedSubscriptionIds)
    {
        var payload = string.Join("\n", normalizedEmails) + "\n---\n" + string.Join("\n", linkedSubscriptionIds);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(payload)));
        return $"plantour-maintenance:stripe-users:{hash}";
    }

    private static HttpRequestMessage CloneRequest(HttpRequestMessage request)
    {
        var clone = new HttpRequestMessage(request.Method, request.RequestUri);

        foreach (var header in request.Headers)
        {
            clone.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        return clone;
    }

    private static string? TryGetFirstSubscriptionPriceId(JsonElement subscription)
    {
        if (!subscription.TryGetProperty("items", out var itemsElement) ||
            !itemsElement.TryGetProperty("data", out var itemsDataElement) ||
            itemsDataElement.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        foreach (var item in itemsDataElement.EnumerateArray())
        {
            if (!item.TryGetProperty("price", out var priceElement))
            {
                continue;
            }

            if (priceElement.ValueKind == JsonValueKind.String)
            {
                return priceElement.GetString();
            }

            if (priceElement.ValueKind == JsonValueKind.Object &&
                priceElement.TryGetProperty("id", out var priceIdElement) &&
                priceIdElement.ValueKind == JsonValueKind.String)
            {
                return priceIdElement.GetString();
            }
        }

        return null;
    }

    private static DateTime? TryGetSubscriptionCurrentPeriodEnd(JsonElement subscription)
    {
        if (!subscription.TryGetProperty("items", out var itemsElement) ||
            !itemsElement.TryGetProperty("data", out var itemsDataElement) ||
            itemsDataElement.ValueKind != JsonValueKind.Array)
        {
            return TryGetUnixDateTime(subscription, "current_period_end");
        }

        foreach (var item in itemsDataElement.EnumerateArray())
        {
            var periodEnd = TryGetUnixDateTime(item, "current_period_end");
            if (periodEnd.HasValue)
            {
                return periodEnd;
            }
        }

        return TryGetUnixDateTime(subscription, "current_period_end");
    }

    private static bool TryGetString(JsonElement element, string propertyName, out string value)
    {
        if (element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String)
        {
            var raw = property.GetString();
            if (!string.IsNullOrWhiteSpace(raw))
            {
                value = raw;
                return true;
            }
        }

        value = string.Empty;
        return false;
    }

    private static string GetRequiredString(JsonElement element, string propertyName, string errorMessage)
    {
        if (TryGetString(element, propertyName, out var value))
        {
            return value;
        }

        throw new CustomException(errorMessage, "STRIPE_INVALID_RESPONSE");
    }

    private static bool TryGetObjectId(JsonElement element, string propertyName, out string value)
    {
        if (element.TryGetProperty(propertyName, out var property))
        {
            if (property.ValueKind == JsonValueKind.String)
            {
                var stringValue = property.GetString();
                if (!string.IsNullOrWhiteSpace(stringValue))
                {
                    value = stringValue;
                    return true;
                }
            }

            if (property.ValueKind == JsonValueKind.Object &&
                property.TryGetProperty("id", out var idElement) &&
                idElement.ValueKind == JsonValueKind.String)
            {
                var objectId = idElement.GetString();
                if (!string.IsNullOrWhiteSpace(objectId))
                {
                    value = objectId;
                    return true;
                }
            }
        }

        value = string.Empty;
        return false;
    }

    private static DateTime? TryGetUnixDateTime(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        long? unixTimestamp = null;

        if (property.ValueKind == JsonValueKind.Number && property.TryGetInt64(out var numberValue))
        {
            unixTimestamp = numberValue;
        }
        else if (property.ValueKind == JsonValueKind.String && long.TryParse(property.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var stringValue))
        {
            unixTimestamp = stringValue;
        }

        return unixTimestamp.HasValue
            ? DateTimeOffset.FromUnixTimeSeconds(unixTimestamp.Value).UtcDateTime
            : null;
    }

    private static decimal? TryGetDecimal(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        if (property.ValueKind == JsonValueKind.Number && property.TryGetDecimal(out var decimalValue))
        {
            return decimalValue;
        }

        if (property.ValueKind == JsonValueKind.String &&
            decimal.TryParse(property.GetString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed))
        {
            return parsed;
        }

        return null;
    }

    private static string FormatCurrencyTotals(IReadOnlyDictionary<string, decimal> currencyTotals)
    {
        var segments = currencyTotals
            .OrderBy(item => item.Key, StringComparer.OrdinalIgnoreCase)
            .Select(item => $"{item.Value / 100m:0.00} {item.Key}");

        return string.Join(" + ", segments);
    }

    private sealed record LocalUserRecord(
        Guid Id,
        string Email,
        string? FirstName,
        string? LastName,
        string AccessTypeName,
        string? PaymentProcessorSubscriptionId,
        bool Temporary,
        DateTime DateJoined,
        int ParticipantAdminLinks);

    private sealed record UserTripPair(Guid UserId, Guid TripId);

    private sealed record CountRecord(Guid UserId, int Count);

    private sealed record DateRecord(Guid UserId, DateTime Value);

    private sealed record PlanPriceRecord(string PriceId, string PlanName);

    private static StripeCustomerRecord SelectPreferredCustomer(
        IReadOnlyList<StripeCustomerRecord> customers,
        IReadOnlyDictionary<string, CustomerSubscriptionSummary> subscriptionsByCustomerId)
    {
        return customers
            .OrderByDescending(customer => subscriptionsByCustomerId.TryGetValue(customer.Id, out var summary) && summary.HasActiveSubscription)
            .ThenByDescending(customer => subscriptionsByCustomerId.TryGetValue(customer.Id, out var summary) ? summary.LatestPlanStartedAt ?? DateTime.MinValue : DateTime.MinValue)
            .ThenByDescending(customer => customer.CreatedAt)
            .First();
    }

    private static bool IsAccessibleSubscription(string? status, DateTime? billingPeriodEnd)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return false;
        }

        if (status.Equals("active", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("trialing", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("past_due", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("unpaid", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("paused", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (!status.Equals("canceled", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return !billingPeriodEnd.HasValue || billingPeriodEnd.Value >= DateTime.UtcNow;
    }

    private static DateTime GetSortDate(DateTime? billingPeriodEnd, DateTime? startedAt, DateTime? createdAt)
    {
        return billingPeriodEnd ?? startedAt ?? createdAt ?? DateTime.MinValue;
    }

    private sealed record StripeCustomerRecord(string Id, string Email, string? Status, DateTime CreatedAt);

    private sealed record SubscriptionRecord(string Id, string CustomerId, string? Status, DateTime? StartedAt, DateTime? CreatedAt, DateTime? BillingPeriodEnd, string? PriceId);

    private sealed record CustomerSubscriptionSummary(
        bool HasActiveSubscription,
        DateTime? LatestPlanStartedAt,
        string? DisplayPlanName,
        string? SubscriptionId,
        string? SubscriptionStatus,
        string? PriceId);

    private sealed record PaymentSummary(string DisplayTotal);

    private sealed record StripeSnapshot(
        IReadOnlyDictionary<string, StripeCustomerRecord> CustomersByEmail,
        IReadOnlyDictionary<string, StripeCustomerRecord> CustomersById,
        IReadOnlyDictionary<string, CustomerSubscriptionSummary> SubscriptionsByCustomerId,
        IReadOnlyDictionary<string, SubscriptionRecord> SubscriptionsBySubscriptionId,
        IReadOnlyDictionary<string, PaymentSummary> PaymentsByCustomerId)
    {
        public static StripeSnapshot Empty { get; } = new(
            new Dictionary<string, StripeCustomerRecord>(StringComparer.OrdinalIgnoreCase),
            new Dictionary<string, StripeCustomerRecord>(StringComparer.OrdinalIgnoreCase),
            new Dictionary<string, CustomerSubscriptionSummary>(StringComparer.OrdinalIgnoreCase),
            new Dictionary<string, SubscriptionRecord>(StringComparer.OrdinalIgnoreCase),
            new Dictionary<string, PaymentSummary>(StringComparer.OrdinalIgnoreCase));
    }
}