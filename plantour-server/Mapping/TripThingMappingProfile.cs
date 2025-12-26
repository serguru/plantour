using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripThingMappingProfile : Profile
{
    public TripThingMappingProfile()
    {
        CreateMap<TripSharedThing, TripSharedDto>()
            .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.Trip.User : null));            

        CreateMap<TripUserThing, TripThingDto>()
            .ForMember(dest => dest.PackageName, opt => opt.MapFrom(src => src.TripUserPackage != null ? src.TripUserPackage.Name : null))
            .ForMember(dest => dest.PackageLabel, opt => opt.MapFrom(src => src.TripUserPackage != null ? src.TripUserPackage.Label : null));
        
        CreateMap<CreateTripThingRequest, TripUserThing>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackage, opt => opt.Ignore());
        
        CreateMap<UpdateTripThingRequest, TripUserThing>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackage, opt => opt.Ignore());
    }
}
