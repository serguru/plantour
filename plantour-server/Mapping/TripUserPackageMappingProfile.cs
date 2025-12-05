using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripUserPackageMappingProfile : Profile
{
    public TripUserPackageMappingProfile()
    {
        CreateMap<TripUserPackage, TripUserPackageDto>();
        
        CreateMap<CreateTripUserPackageRequest, TripUserPackage>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore());
        
        CreateMap<UpdateTripUserPackageRequest, TripUserPackage>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore());
    }
}
