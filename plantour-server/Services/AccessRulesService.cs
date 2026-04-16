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
    private readonly IPaymentProcessorService _paymentProcessorService;
    private readonly PlanRepository _planRepository;

    public AccessRulesService(
        IPaymentProcessorService paymentProcessorService,
        PlanRepository planRepository
    )
    {
        _paymentProcessorService = paymentProcessorService;
        _planRepository = planRepository;
    }

    private async Task<AccessProcessResult> ProcessTemporaryUser(User user)
    {
        AccessProcessResult result = new();
        result.PriceName = "Starter Free";
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
        a.GetById(80).Granted = false; // Can add a dictionary/trip todo over a limit
        a.GetById(80).Value = plan!.AllowedTodos; // Get allowed todos from the Starter plan
        a.GetById(90).Granted = false; // Can add a trip expense over a limit
        a.GetById(90).Value = plan!.AllowedExpenses; // Get allowed expenses from the Starter plan
        a.GetById(100).Granted = false; // Can add itinerary parts over a limit
        a.GetById(100).Value = plan!.AllowedItineraryParts; // Get allowed itinerary parts from the Starter plan
        a.GetById(110).Granted = false; // Can add trip activities over a limit
        a.GetById(110).Value = plan!.AllowedActivities; // Get allowed activities from the Starter plan

        result.AccessRulesObject = a;
        result.UserObject = user;

//        result.PriceName = user.PriceEnum!.Name;

        result.BillingPeriodStart = null;
        result.BillingPeriodEnd = null;

        return result;
    }
    private async Task<AccessRules> ProcessUser(PaymentProcessorSubscription? subscription, UserRole role)
    {
        var a = new AccessRules();
        var isAdmin = role == UserRole.Admin;
        Plan? plan;
        if (subscription != null)
        {
            plan = await _planRepository.GetByPaymentProcessorPriceIdAsync(subscription.PriceId) ?? throw new CustomException($"Plan not found for PriceId: {subscription.PriceId}");
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
        a.GetById(80).Granted = plan!.AllowedTodos == null; // Can add a dictionary/trip todo over a limit
        a.GetById(80).Value = plan!.AllowedTodos == null ? null : plan.AllowedTodos; // Get allowed todos from the plan
        a.GetById(90).Granted = plan!.AllowedExpenses == null; // Can add a trip expense over a limit
        a.GetById(90).Value = plan!.AllowedExpenses == null ? null : plan.AllowedExpenses; // Get allowed expenses from the plan
        a.GetById(100).Granted = plan!.AllowedItineraryParts == null; // Can add itinerary parts over a limit
        a.GetById(100).Value = plan!.AllowedItineraryParts == null ? null : plan.AllowedItineraryParts; // Get allowed itinerary parts from the plan
        a.GetById(110).Granted = plan!.AllowedActivities == null; // Can add trip activities over a limit
        a.GetById(110).Value = plan!.AllowedActivities == null ? null : plan.AllowedActivities; // Get allowed activities from the plan

        return a;
    }

    public async Task<AccessProcessResult> ProcessAccessRulesAsync(User user,  UserRole role, Guid adminId, bool isTemporary)
    {
        if (isTemporary)
        {
            return await ProcessTemporaryUser(user);
        }
        // In this call the user can be updated, saved to the DB and the updated instance is returned
        var subscription = await _paymentProcessorService.GetActiveSubscriptionByUserAsync(user, role, adminId);

        //var priceName = subscription == null ? user.PriceEnum!.Name : subscription.PriceName;
        var billingPeriodStart = subscription?.BillingPeriodStart;
        var billingPeriodEnd = subscription?.BillingPeriodEnd;

        AccessProcessResult result = new()
        {
            AccessRulesObject = await ProcessUser(subscription, role),
            UserObject = user,
            PriceName = subscription != null ? subscription.PriceName : "Starter Free",
            BillingPeriodStart = billingPeriodStart,
            BillingPeriodEnd = billingPeriodEnd
        };
        return result;
    }
}
