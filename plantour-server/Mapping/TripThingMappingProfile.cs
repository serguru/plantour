using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripThingMappingProfile : Profile
{
    public TripThingMappingProfile()
    {
        CreateMap<TripUserThing, TripThingDto>()
            .ForMember(dest => dest.PackageName, opt => opt.MapFrom(src => src.TripPack != null ? src.TripPack.Name : null))
            .ForMember(dest => dest.PackageLabel, opt => opt.MapFrom(src => src.TripPack != null ? src.TripPack.Label : null));
        
        CreateMap<CreateTripThingRequest, TripUserThing>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.TripPack, opt => opt.Ignore());
        
        CreateMap<UpdateTripThingRequest, TripUserThing>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.TripPack, opt => opt.Ignore());
    }
}
