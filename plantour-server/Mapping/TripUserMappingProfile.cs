using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripUserMappingProfile : Profile
{
    public TripUserMappingProfile()
    {
        CreateMap<TripUser, TripUserDto>();
        
        CreateMap<CreateTripUserRequest, TripUser>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AdminParticipant, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackages, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserThings, opt => opt.Ignore());
        
        CreateMap<UpdateTripUserRequest, TripUser>()
            .ForMember(dest => dest.AdminParticipant, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackages, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserThings, opt => opt.Ignore());
    }
}
