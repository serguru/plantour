using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripExpenseMappingProfile : Profile
{
    public TripExpenseMappingProfile()
    {
        CreateMap<TripUserExpense, TripExpenseDto>()
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency != null ? src.Currency.Name : null))
            .ForMember(dest => dest.EffectiveCurrencyId, opt => opt.MapFrom(src => src.CurrencyId ?? src.TripUser.Trip.CurrencyId))
            .ForMember(dest => dest.EffectiveCurrency, opt => opt.MapFrom(src => src.Currency != null ? src.Currency.Name : src.TripUser.Trip.Currency.Name))
            .ForMember(dest => dest.EffectiveRate, opt => opt.MapFrom(src => src.Rate ?? 1m))
            .ForMember(dest => dest.AmountInTripCurrency, opt => opt.MapFrom(src => decimal.Round(src.Amount * (src.Rate ?? 1m), 2)))
            .ForMember(dest => dest.RecipientEmail, opt => opt.MapFrom(src => src.Recipient != null ? src.Recipient.AdminParticipant.Participant.Email : null))
            .ForMember(dest => dest.RecipientFirstName, opt => opt.MapFrom(src => src.Recipient != null ? src.Recipient.AdminParticipant.Participant.FirstName : null))
            .ForMember(dest => dest.RecipientLastName, opt => opt.MapFrom(src => src.Recipient != null ? src.Recipient.AdminParticipant.Participant.LastName : null))
            .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.TripUser.AdminParticipant.Participant.Email))
            .ForMember(dest => dest.UserFirstName, opt => opt.MapFrom(src => src.TripUser.AdminParticipant.Participant.FirstName))
            .ForMember(dest => dest.UserLastName, opt => opt.MapFrom(src => src.TripUser.AdminParticipant.Participant.LastName));

        CreateMap<CreateTripExpenseRequest, TripUserExpense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Rate, opt => opt.Ignore())
            .ForMember(dest => dest.Finished, opt => opt.Ignore())
            .ForMember(dest => dest.FinishedAt, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.Currency, opt => opt.Ignore())
            .ForMember(dest => dest.Recipient, opt => opt.Ignore());

        CreateMap<UpdateTripExpenseRequest, TripUserExpense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Rate, opt => opt.Ignore())
            .ForMember(dest => dest.Finished, opt => opt.Ignore())
            .ForMember(dest => dest.FinishedAt, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.Currency, opt => opt.Ignore())
            .ForMember(dest => dest.Recipient, opt => opt.Ignore());
    }
}