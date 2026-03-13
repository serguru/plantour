using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripSharedTodoMappingProfile : Profile
{
    public TripSharedTodoMappingProfile()
    {
        CreateMap<TripSharedTodo, TripSharedTodoDto>()
            .ForMember(dest => dest.AssigneeFirstName, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.FirstName : null))
            .ForMember(dest => dest.AssigneeLastName, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.LastName : null))
            .ForMember(dest => dest.AssigneeEmail, opt => opt.MapFrom(src => src.AssignedTo != null ? src.AssignedTo.AdminParticipant.Participant.Email : null))
            .ForMember(dest => dest.AssigneeFinished, opt => opt.MapFrom(src => src.AssignedTodo != null ? src.AssignedTodo.Finished : null))
            .ForMember(dest => dest.IsTargeted, opt => opt.MapFrom(src => src.AssignedToId.HasValue));

        CreateMap<CreateTripSharedTodoRequest, TripSharedTodo>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        CreateMap<UpdateTripSharedTodoRequest, TripSharedTodo>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
    }
}