using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripSharedExpenseMappingProfile : Profile
{
    public TripSharedExpenseMappingProfile()
    {
        CreateMap<TripSharedExpense, TripSharedExpenseDto>()
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency != null ? src.Currency.Name : null))
            .ForMember(dest => dest.EffectiveCurrencyId, opt => opt.MapFrom(src => src.CurrencyId ?? src.Trip.CurrencyId))
            .ForMember(dest => dest.EffectiveCurrency, opt => opt.MapFrom(src => src.Currency != null ? src.Currency.Name : src.Trip.Currency.Name))
            .ForMember(dest => dest.AmountInTripCurrency, opt => opt.MapFrom(src =>
                src.AssignedExpense != null ? decimal.Round(src.AssignedExpense.Amount * (src.AssignedExpense.Rate ?? 1m), 2) :
                (src.CurrencyId == null || src.CurrencyId == src.Trip.CurrencyId ? src.Amount : (decimal?)null)))
            .ForMember(dest => dest.AssigneeFirstName, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.FirstName : null))
            .ForMember(dest => dest.AssigneeLastName, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.LastName : null))
            .ForMember(dest => dest.AssigneeEmail, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.Email : null))
            .ForMember(dest => dest.IsTargeted, opt => opt.MapFrom(src => src.AssignedToId.HasValue));

        CreateMap<CreateTripSharedExpenseRequest, TripSharedExpense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedExpenseId, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedExpense, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Rejected, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore())
            .ForMember(dest => dest.Currency, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedTo, opt => opt.Ignore());

        CreateMap<UpdateTripSharedExpenseRequest, TripSharedExpense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedExpenseId, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedExpense, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Rejected, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore())
            .ForMember(dest => dest.Currency, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedTo, opt => opt.Ignore());
    }
}