using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripSharedMappingProfile : Profile
{
    public TripSharedMappingProfile()
    {

        CreateMap<User, UserDto>();

        CreateMap<TripSharedThing, TripSharedDto>()
            .ForMember(dest => dest.AssignedTo, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant : null))
            .ForMember(dest => dest.IsTargeted, opt => opt.MapFrom(src => src.AssignedToId.HasValue));

        CreateMap<CreateTripSharedRequest, TripSharedThing>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        CreateMap<UpdateTripSharedRequest, TripSharedThing>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
    }
}
