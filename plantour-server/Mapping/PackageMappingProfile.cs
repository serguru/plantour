using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class PackageMappingProfile : Profile
{
    public PackageMappingProfile()
    {
        CreateMap<UserPackage, PackDto>()
            .ForMember(dest => dest.IsTargeted, opt => opt.MapFrom(src => false));
        
        CreateMap<CreatePackageRequest, UserPackage>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());
        
        CreateMap<UpdatePackageRequest, UserPackage>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());
    }
}
