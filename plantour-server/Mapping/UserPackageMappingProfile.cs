using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class UserPackageMappingProfile : Profile
{
    public UserPackageMappingProfile()
    {
        CreateMap<UserPackage, UserPackageDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));
        
        CreateMap<CreateUserPackageRequest, UserPackage>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackages, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());
        
        CreateMap<UpdateUserPackageRequest, UserPackage>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackages, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());
    }
}
