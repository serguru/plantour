using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripUserThingMappingProfile : Profile
{
    public TripUserThingMappingProfile()
    {
        CreateMap<TripUserThing, TripUserThingDto>();
        
        CreateMap<CreateTripUserThingRequest, TripUserThing>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackage, opt => opt.Ignore());
        
        CreateMap<UpdateTripUserThingRequest, TripUserThing>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackage, opt => opt.Ignore());
    }
}
