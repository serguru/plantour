using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripMappingProfile : Profile
{
    public TripMappingProfile()
    {
        CreateMap<Trip, TripDto>();
        CreateMap<TripStatus, TripStatusDto>();
        
        CreateMap<CreateTripRequest, Trip>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.TripStatus, opt => opt.Ignore())
            .ForMember(dest => dest.TripUsers, opt => opt.Ignore())
            .ForMember(dest => dest.Invitations, opt => opt.Ignore());
        
        CreateMap<UpdateTripRequest, Trip>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.TripStatus, opt => opt.Ignore())
            .ForMember(dest => dest.TripUsers, opt => opt.Ignore())
            .ForMember(dest => dest.Invitations, opt => opt.Ignore());
    }
}
