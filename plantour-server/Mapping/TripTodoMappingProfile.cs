using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripTodoMappingProfile : Profile
{
    public TripTodoMappingProfile()
    {
        _ = CreateMap<TripUserTodo, TripTodoDto>()
            .ForMember(dest => dest.ItineraryPartName, opt => opt.MapFrom(x => x.ItineraryPart != null ? x.ItineraryPart.Name : null))
            .ForMember(dest => dest.TripSharedTodoId, opt => opt.MapFrom(x => x.TripSharedTodos != null && x.TripSharedTodos.Count > 0 ? x.TripSharedTodos.First().Id : (Guid?)null))
            .ForMember(dest => dest.AssignedAt, opt => opt.MapFrom(x => x.TripSharedTodos != null && x.TripSharedTodos.Count > 0 ? DateOnly.FromDateTime(x.TripSharedTodos.First().AssignedAt.HasValue ? x.TripSharedTodos.First().AssignedAt!.Value : DateTime.MinValue) : (DateOnly?)null))
            .ForMember(dest => dest.AssignedDeadline, opt => opt.MapFrom(x => x.TripSharedTodos != null && x.TripSharedTodos.Count > 0 ? DateOnly.FromDateTime(x.TripSharedTodos.First().AssignedDeadline.HasValue ? x.TripSharedTodos.First().AssignedDeadline!.Value : DateTime.MinValue) : (DateOnly?)null));

        CreateMap<CreateTripTodoRequest, TripUserTodo>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ItineraryPart, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore());

        CreateMap<UpdateTripTodoRequest, TripUserTodo>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ItineraryPart, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore());
    }
}