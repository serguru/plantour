using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;
using PlantourApi.Models;

namespace plantour_server.Services;

public interface IPaddleService
{
    Task<bool> ActiveSubscriptionExists(string email);
    Task<PaddleSubscription?> GetActiveSubscriptionByUserAsync(User user, UserRole role, Guid adminId);
    Task<PaddleSubscription?> GetActiveSubscriptionByUserIdAsync(Guid userId, UserRole role, Guid adminId);

    Task<string?> GetSubscriptionIdAsync(PaddleSubscriptionIdRequest request);
    Task<PortalSessionResponse> CreateCustomerPortalSessionAsync();

    Task<IEnumerable<PaddleProduct>?> GetActiveProductsAsync();
    Task UpgradePlanPriceAsync(string oldPlanPrice, string newPlanPrice);
    Task DowngradePlanPriceAsync(Guid userId, string oldPlanPrice, string newPlanPrice);
}
