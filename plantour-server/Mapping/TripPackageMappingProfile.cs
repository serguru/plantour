using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripPackageMappingProfile : Profile
{
    public TripPackageMappingProfile()
    {
        CreateMap<TripPack, TripPackageDto>();
        
        CreateMap<CreateTripPackageRequest, TripPack>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore());
        
        CreateMap<UpdateTripPackageRequest, TripPack>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore());
    }
}
