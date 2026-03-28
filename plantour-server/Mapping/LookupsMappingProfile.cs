using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class LookupsMappingProfile : Profile
{
    public LookupsMappingProfile()
    {
        CreateMap<PackingStatus, PackingStatusDto>();
        CreateMap<CommunicationType, CommunicationTypeDto>();
        CreateMap<Currency, CurrencyDto>();
        CreateMap<ItineraryPartCategory, ItineraryPartCategoryDto>();
        CreateMap<PaymentMethod, PaymentMethodDto>();
        CreateMap<ThingCategory, ThingCategoryDto>();
        CreateMap<TodoCategory, TodoCategoryDto>();
        CreateMap<TripStatus, TripStatusDto>();
        CreateMap<Unit, UnitDto>();
    }
}
