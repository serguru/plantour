using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using plantour_server.DbModels;
using plantour_server.Models;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class AccessRulesService : IAccessRulesService
{
    private readonly IPaddleService _paddleService;
    private readonly PlanRepository _planRepository;

    public AccessRulesService(
        IPaddleService paddleService,
        PlanRepository planRepository
    )
    {
        _paddleService = paddleService;
        _planRepository = planRepository;
    }

    private async Task<AccessProcessResult> ProcessTemporaryUser(User user)
    {
        AccessProcessResult result = new();
        var a = new AccessRules();
        var plan = await _planRepository.GetByNameAsync("Starter");

        a.GetById(10).Granted = true; // Can add/edit/delete travelers
        a.GetById(20).Granted = true; // Can add/edit/delete shared items
        a.GetById(30).Granted = true; // Can add/edit/delete trips
        a.GetById(40).Granted = false; // Can add a dictionary/trip item over a limit
        a.GetById(40).Value = plan!.AllowedItems; // Get allowed items from the Starter plan
        a.GetById(50).Granted = false; // Can add a trip traveler over a limit
        a.GetById(50).Value = plan!.AllowedTravelers; // Get allowed travelers from the Starter plan
        a.GetById(60).Granted = false; // Can send extended prompts to the AI
        a.GetById(70).Granted = false; // Can send prompts to the AI over a limit
        a.GetById(70).Value = plan!.AllowedAiPrompts; // Get allowed AI prompts from the Starter plan

        result.AccessRulesObject = a;
        result.UserObject = user;

        return result;
    }
    private async Task<AccessRules> ProcessUser(PaddleSubscription? subscription, UserRole role)
    {
        var a = new AccessRules();
        var isAdmin = role == UserRole.Admin;
        Plan? plan;
        if (subscription != null)
        {
            plan = await _planRepository.GetByPriceIdAsync(subscription.PriceId) ?? throw new CustomException($"Plan not found for PriceId: {subscription.PriceId}");
        } else
        {
            // If no subscription found, treat the user as if they are on the free Starter plan
            plan = await _planRepository.GetByNameAsync("Starter") ?? throw new CustomException("Starter plan not found");
        }

        a.GetById(10).Granted = isAdmin; // Can add/edit/delete travelers
        a.GetById(20).Granted = isAdmin; // Can add/edit/delete shared items
        a.GetById(30).Granted = isAdmin; // Can add/edit/delete trips
        a.GetById(40).Granted = plan!.AllowedItems == null; // Can add a dictionary/trip item over a limit
        a.GetById(40).Value = plan!.AllowedItems == null ? null : plan.AllowedItems; // Get allowed items from the plan
        a.GetById(50).Granted = plan!.AllowedTravelers == null; // Can add a trip traveler over a limit
        a.GetById(50).Value = plan!.AllowedTravelers == null ? null : plan.AllowedTravelers; // Get allowed travelers from the plan
        a.GetById(60).Granted = plan!.ExtendedAiAllowed; // Can send extended prompts to the AI
        a.GetById(70).Granted = plan!.AllowedAiPrompts == null; // Can send prompts to the AI over a limit
        a.GetById(70).Value = plan!.AllowedAiPrompts == null ? null : plan.AllowedAiPrompts; // Get allowed AI prompts from the plan

        return a;
    }

    // TODO: If a temporary user clicks sign out show them a warning first
    // TODO: for temporary users, i.e. guests, show a banner at the top
    // TODO: if a temporary user wants to move to a public plan they can choose that plan in the profile page and then a new account will be created
    public async Task<AccessProcessResult> ProcessAccessRulesAsync(User user,  UserRole role, Guid adminId, bool isTemporary)
    {
        if (isTemporary)
        {
            return await ProcessTemporaryUser(user);
        }
        var subscription = await _paddleService.GetActiveSubscriptionByUserAsync(user, role, adminId);

        AccessProcessResult result = new()
        {
            AccessRulesObject = await ProcessUser(subscription, role),
            UserObject = user
        };
        return result;
    }
}
