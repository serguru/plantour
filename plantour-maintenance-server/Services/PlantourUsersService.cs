using System.Globalization;
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
    IOptions<PaddleSettings> paddleSettingsOptions) : IPlantourUsersService
{
    private const int PaddleCustomersBatchSize = 100;
    private const int PaddleSubscriptionsBatchSize = 200;
    private const int PaddleTransactionsBatchSize = 30;
    private static readonly TimeSpan PaddleSnapshotCacheDuration = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan PaddleSnapshotRequestTimeout = TimeSpan.FromSeconds(12);

    private readonly PlantourContext _context = context;
    private readonly HttpClient _httpClient = httpClient;
    private readonly IMemoryCache _memoryCache = memoryCache;
    private readonly PaddleSettings _paddleSettings = paddleSettingsOptions.Value;

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

        var paddleSnapshot = await GetPaddleSnapshotAsync(normalizedEmails, cancellationToken);

        return users.Select(user =>
        {
            paddleSnapshot.CustomersByEmail.TryGetValue(NormalizeEmail(user.Email), out var paddleCustomer);

            CustomerSubscriptionSummary? subscriptionSummary = null;
            PaymentSummary? paymentSummary = null;

            if (paddleCustomer != null)
            {
                paddleSnapshot.SubscriptionsByCustomerId.TryGetValue(paddleCustomer.Id, out subscriptionSummary);
                paddleSnapshot.PaymentsByCustomerId.TryGetValue(paddleCustomer.Id, out paymentSummary);
            }

            return new PlantourUserRowDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = BuildFullName(user.FirstName, user.LastName),
                Role = BuildRole(user.AccessTypeName, user.ParticipantAdminLinks),
                Plan = subscriptionSummary?.DisplayPlanName,
                PaddleCustomerId = paddleCustomer?.Id,
                PaddleCustomerStatus = paddleCustomer?.Status,
                PaddleSubscriptionId = subscriptionSummary?.SubscriptionId,
                PaddleSubscriptionStatus = subscriptionSummary?.SubscriptionStatus,
                PaddlePriceId = subscriptionSummary?.PriceId,
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

    private async Task<PaddleSnapshot> GetPaddleSnapshotAsync(IReadOnlyList<string> normalizedEmails, CancellationToken cancellationToken)
    {
        if (normalizedEmails.Count == 0)
        {
            return PaddleSnapshot.Empty;
        }

        var cacheKey = BuildPaddleSnapshotCacheKey(normalizedEmails);

        if (_memoryCache.TryGetValue<PaddleSnapshot>(cacheKey, out var cachedSnapshot) && cachedSnapshot != null)
        {
            return cachedSnapshot;
        }

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(PaddleSnapshotRequestTimeout);

        try
        {
            var customersByEmail = await GetCustomersByEmailAsync(normalizedEmails, timeoutCts.Token);
            var customerIds = customersByEmail.Values
                .Select(customer => customer.Id)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var subscriptionsByCustomerId = await GetSubscriptionsByCustomerIdAsync(customerIds, timeoutCts.Token);
            var paymentsByCustomerId = await GetPaymentsByCustomerIdAsync(customerIds, timeoutCts.Token);

            var snapshot = new PaddleSnapshot(customersByEmail, subscriptionsByCustomerId, paymentsByCustomerId);
            _memoryCache.Set(cacheKey, snapshot, PaddleSnapshotCacheDuration);
            return snapshot;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return PaddleSnapshot.Empty;
        }
        catch (Exception)
        {
            return PaddleSnapshot.Empty;
        }
    }

    private async Task<Dictionary<string, PaddleCustomerRecord>> GetCustomersByEmailAsync(
        IReadOnlyList<string> normalizedEmails,
        CancellationToken cancellationToken)
    {
        var result = new Dictionary<string, PaddleCustomerRecord>(StringComparer.OrdinalIgnoreCase);

        foreach (var emailBatch in Batch(normalizedEmails, PaddleCustomersBatchSize))
        {
            var emailFilter = string.Join(",", emailBatch.Select(Uri.EscapeDataString));
            var customers = await GetAllPaddleEntitiesAsync(
                $"customers?status=active,archived&per_page=200&order_by=id[ASC]&email={emailFilter}",
                cancellationToken);

            foreach (var customer in customers)
            {
                if (!TryGetString(customer, "email", out var email) || string.IsNullOrWhiteSpace(email))
                {
                    continue;
                }

                if (!TryGetString(customer, "id", out var id) || string.IsNullOrWhiteSpace(id))
                {
                    continue;
                }

                var normalizedEmail = NormalizeEmail(email);
                var createdAt = TryGetDateTime(customer, "created_at");
                var status = TryGetString(customer, "status", out var statusValue) ? statusValue : null;
                var nextRecord = new PaddleCustomerRecord(id, normalizedEmail, status, createdAt ?? DateTime.MinValue);

                if (!result.TryGetValue(normalizedEmail, out var currentRecord) || Prefer(nextRecord, currentRecord))
                {
                    result[normalizedEmail] = nextRecord;
                }
            }
        }

        return result;

        static bool Prefer(PaddleCustomerRecord candidate, PaddleCustomerRecord existing)
        {
            var candidateActive = string.Equals(candidate.Status, "active", StringComparison.OrdinalIgnoreCase);
            var existingActive = string.Equals(existing.Status, "active", StringComparison.OrdinalIgnoreCase);

            if (candidateActive != existingActive)
            {
                return candidateActive;
            }

            return candidate.CreatedAt > existing.CreatedAt;
        }
    }

    private async Task<Dictionary<string, CustomerSubscriptionSummary>> GetSubscriptionsByCustomerIdAsync(
        IReadOnlyList<string> customerIds,
        CancellationToken cancellationToken)
    {
        if (customerIds.Count == 0)
        {
            return new Dictionary<string, CustomerSubscriptionSummary>(StringComparer.OrdinalIgnoreCase);
        }

        var grouped = new Dictionary<string, List<SubscriptionRecord>>(StringComparer.OrdinalIgnoreCase);

        foreach (var customerBatch in Batch(customerIds, PaddleSubscriptionsBatchSize))
        {
            var customerFilter = string.Join(",", customerBatch.Select(Uri.EscapeDataString));
            var subscriptions = await GetAllPaddleEntitiesAsync(
                $"subscriptions?per_page=200&order_by=id[ASC]&customer_id={customerFilter}",
                cancellationToken);

            foreach (var subscription in subscriptions)
            {
                if (!TryGetString(subscription, "id", out var subscriptionId) || string.IsNullOrWhiteSpace(subscriptionId))
                {
                    continue;
                }

                if (!TryGetString(subscription, "customer_id", out var customerId) || string.IsNullOrWhiteSpace(customerId))
                {
                    continue;
                }

                var status = TryGetString(subscription, "status", out var statusValue) ? statusValue : null;
                var startedAt = TryGetDateTime(subscription, "started_at");
                var createdAt = TryGetDateTime(subscription, "created_at");
                var priceId = TryGetFirstSubscriptionPriceId(subscription);

                if (!grouped.TryGetValue(customerId, out var customerSubscriptions))
                {
                    customerSubscriptions = [];
                    grouped[customerId] = customerSubscriptions;
                }

                customerSubscriptions.Add(new SubscriptionRecord(subscriptionId, customerId, status, startedAt, createdAt, priceId));
            }
        }

        var planNamesByPriceId = await _context.Prices
            .AsNoTracking()
            .Where(price => price.PaddlePriceId != null)
            .Select(price => new PlanPriceRecord(price.PaddlePriceId!, price.Plan.Name))
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
            .OrderByDescending(item => item.StartedAt ?? item.CreatedAt ?? DateTime.MinValue)
            .ToList();

        var activeSubscription = ordered.FirstOrDefault(item => string.Equals(item.Status, "active", StringComparison.OrdinalIgnoreCase));
        var latestSubscription = ordered[0];
        var planSource = activeSubscription ?? latestSubscription;

        string? planName = null;
        if (!string.IsNullOrWhiteSpace(planSource.PriceId))
        {
            planNamesByPriceId.TryGetValue(planSource.PriceId, out planName);
        }

        return new CustomerSubscriptionSummary(
            activeSubscription != null,
            latestSubscription.StartedAt,
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

        var totalsByCustomerId = new Dictionary<string, Dictionary<string, decimal>>(StringComparer.OrdinalIgnoreCase);

        foreach (var customerBatch in Batch(customerIds, PaddleTransactionsBatchSize))
        {
            var customerFilter = string.Join(",", customerBatch.Select(Uri.EscapeDataString));
            var transactions = await GetAllPaddleEntitiesAsync(
                $"transactions?status=completed,billed&per_page=30&customer_id={customerFilter}",
                cancellationToken);

            foreach (var transaction in transactions)
            {
                if (!TryGetString(transaction, "customer_id", out var customerId) || string.IsNullOrWhiteSpace(customerId))
                {
                    continue;
                }

                var currencyCode = TryGetString(transaction, "currency_code", out var code) && !string.IsNullOrWhiteSpace(code)
                    ? code.ToUpperInvariant()
                    : "UNKNOWN";

                if (!transaction.TryGetProperty("payments", out var paymentsElement) || paymentsElement.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var payment in paymentsElement.EnumerateArray())
                {
                    if (!TryGetString(payment, "status", out var paymentStatus) || !string.Equals(paymentStatus, "captured", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    if (!TryGetString(payment, "amount", out var amountValue) || !decimal.TryParse(amountValue, NumberStyles.Number, CultureInfo.InvariantCulture, out var minorUnits))
                    {
                        continue;
                    }

                    if (!totalsByCustomerId.TryGetValue(customerId, out var currencyTotals))
                    {
                        currencyTotals = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
                        totalsByCustomerId[customerId] = currencyTotals;
                    }

                    currencyTotals[currencyCode] = currencyTotals.GetValueOrDefault(currencyCode) + minorUnits;
                }
            }
        }

        return totalsByCustomerId.ToDictionary(
            item => item.Key,
            item => new PaymentSummary(FormatCurrencyTotals(item.Value)),
            StringComparer.OrdinalIgnoreCase);
    }

    private async Task<List<JsonElement>> GetAllPaddleEntitiesAsync(string path, CancellationToken cancellationToken)
    {
        EnsurePaddleConfigured();

        if (_httpClient.BaseAddress == null)
        {
            _httpClient.BaseAddress = new Uri(_paddleSettings.ApiBaseUrl!, UriKind.Absolute);
        }

        var result = new List<JsonElement>();
        string? nextPath = path;

        while (!string.IsNullOrWhiteSpace(nextPath))
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, nextPath);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _paddleSettings.ApiKey);

            using var response = await SendPaddleRequestWithRetryAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new CustomException($"Paddle request failed with {(int)response.StatusCode}: {body}", "PADDLE_REQUEST_FAILED");
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            if (!document.RootElement.TryGetProperty("data", out var dataElement) || dataElement.ValueKind != JsonValueKind.Array)
            {
                throw new CustomException("Paddle response does not contain an array data property.", "PADDLE_INVALID_RESPONSE");
            }

            foreach (var item in dataElement.EnumerateArray())
            {
                result.Add(item.Clone());
            }

            nextPath = TryGetNextPage(document.RootElement);
        }

        return result;
    }

    private async Task<HttpResponseMessage> SendPaddleRequestWithRetryAsync(HttpRequestMessage request, CancellationToken cancellationToken)
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

    private void EnsurePaddleConfigured()
    {
        if (string.IsNullOrWhiteSpace(_paddleSettings.ApiBaseUrl) || string.IsNullOrWhiteSpace(_paddleSettings.ApiKey))
        {
            throw new CustomException("PaddleSettings ApiBaseUrl and ApiKey must both be configured for maintenance users.", "PADDLE_SETTINGS_MISSING");
        }
    }

    private static string? TryGetNextPage(JsonElement root)
    {
        if (!root.TryGetProperty("meta", out var metaElement) ||
            !metaElement.TryGetProperty("pagination", out var paginationElement))
        {
            return null;
        }

        var hasMore = paginationElement.TryGetProperty("has_more", out var hasMoreElement) &&
            hasMoreElement.ValueKind == JsonValueKind.True;

        if (!hasMore ||
            !paginationElement.TryGetProperty("next", out var nextElement) ||
            nextElement.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        var next = nextElement.GetString();
        return string.IsNullOrWhiteSpace(next) ? null : next;
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

    private static string BuildPaddleSnapshotCacheKey(IReadOnlyList<string> normalizedEmails)
    {
        var payload = string.Join("\n", normalizedEmails);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(payload)));
        return $"plantour-maintenance:paddle-users:{hash}";
    }

    private static IEnumerable<T[]> Batch<T>(IReadOnlyList<T> source, int size)
    {
        for (var index = 0; index < source.Count; index += size)
        {
            var length = Math.Min(size, source.Count - index);
            var batch = new T[length];
            for (var offset = 0; offset < length; offset++)
            {
                batch[offset] = source[index + offset];
            }

            yield return batch;
        }
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
        if (!subscription.TryGetProperty("items", out var itemsElement) || itemsElement.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        foreach (var item in itemsElement.EnumerateArray())
        {
            if (item.TryGetProperty("price", out var priceElement) &&
                priceElement.TryGetProperty("id", out var priceIdElement) &&
                priceIdElement.ValueKind == JsonValueKind.String)
            {
                return priceIdElement.GetString();
            }
        }

        return null;
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

    private static DateTime? TryGetDateTime(JsonElement element, string propertyName)
    {
        if (!TryGetString(element, propertyName, out var raw))
        {
            return null;
        }

        return DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal, out var value)
            ? value
            : null;
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
        bool Temporary,
        DateTime DateJoined,
        int ParticipantAdminLinks);

    private sealed record UserTripPair(Guid UserId, Guid TripId);

    private sealed record CountRecord(Guid UserId, int Count);

    private sealed record DateRecord(Guid UserId, DateTime Value);

    private sealed record PlanPriceRecord(string PriceId, string PlanName);

    private sealed record PaddleCustomerRecord(string Id, string Email, string? Status, DateTime CreatedAt);

    private sealed record SubscriptionRecord(string Id, string CustomerId, string? Status, DateTime? StartedAt, DateTime? CreatedAt, string? PriceId);

    private sealed record CustomerSubscriptionSummary(
        bool HasActiveSubscription,
        DateTime? LatestPlanStartedAt,
        string? DisplayPlanName,
        string? SubscriptionId,
        string? SubscriptionStatus,
        string? PriceId);

    private sealed record PaymentSummary(string DisplayTotal);

    private sealed record PaddleSnapshot(
        IReadOnlyDictionary<string, PaddleCustomerRecord> CustomersByEmail,
        IReadOnlyDictionary<string, CustomerSubscriptionSummary> SubscriptionsByCustomerId,
        IReadOnlyDictionary<string, PaymentSummary> PaymentsByCustomerId)
    {
        public static PaddleSnapshot Empty { get; } = new(
            new Dictionary<string, PaddleCustomerRecord>(StringComparer.OrdinalIgnoreCase),
            new Dictionary<string, CustomerSubscriptionSummary>(StringComparer.OrdinalIgnoreCase),
            new Dictionary<string, PaymentSummary>(StringComparer.OrdinalIgnoreCase));
    }
}