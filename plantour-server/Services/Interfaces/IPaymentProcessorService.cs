using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using PlantourApi.Models;

namespace plantour_server.Services;

public interface IPaymentProcessorService
{
    Task<bool> ActiveSubscriptionExists(string email);
    Task<PaymentProcessorSubscription?> GetActiveSubscriptionByUserAsync(User user, UserRole role, Guid adminId);
    Task<PaymentProcessorSubscription?> GetActiveSubscriptionByUserIdAsync(Guid userId, UserRole role, Guid adminId);

    Task<PaymentProcessorSubscription?> GetActiveSubscriptionByEmailAsync(string email);

    Task<string?> GetActiveSubscriptionIdAsync(PaymentProcessorSubscriptionIdRequest request);
    Task<PortalSessionResponse> CreateCustomerPortalSessionAsync();

    Task<IEnumerable<PaymentProcessorProduct>?> GetActiveProductsAsync();
    Task UpgradePlanPriceAsync(string oldPlanPrice, string newPlanPrice);
    Task DowngradePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice);
    Task<string?> GetActiveCustomerIdByEmailAsync(string email);
    Task<string?> GetActiveCustomerEmailByIdAsync(PaymentProcessorCustomerEmailRequest request);
}