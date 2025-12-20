using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripUserMappingProfile : Profile
{
    public TripUserMappingProfile()
    {
        CreateMap<TripUser, TripUserDto>()
        .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.AdminParticipant.Participant.Email))
        .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.AdminParticipant.Participant.FirstName))
        .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.AdminParticipant.Participant.LastName))
        .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.AdminParticipant.Participant.Phone));


        CreateMap<CreateTripUserRequest, TripUser>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AdminParticipant, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackages, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserThingTripUsers, opt => opt.Ignore());
        
        CreateMap<UpdateTripUserRequest, TripUser>()
            .ForMember(dest => dest.AdminParticipant, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackages, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserThingTripUsers, opt => opt.Ignore());
    }
}
