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
            .ForMember(dest => dest.AssigneeFirstName, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.FirstName : null))

            .ForMember(dest => dest.AssigneeLastName, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.LastName : null))

            .ForMember(dest => dest.AssigneeEmail, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.Email : null))

            .ForMember(dest => dest.AssigneeFinished, opt => opt.MapFrom(src => src.AssignedThing != null ? src.AssignedThing.Finished : null))

            .ForMember(dest => dest.IsTargeted, opt => opt.MapFrom(src => src.AssignedToId.HasValue));

        CreateMap<CreateTripSharedRequest, TripSharedThing>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        CreateMap<UpdateTripSharedRequest, TripSharedThing>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
    }
}
