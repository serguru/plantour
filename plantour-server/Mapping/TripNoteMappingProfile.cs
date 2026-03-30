using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripNoteMappingProfile : Profile
{
    public TripNoteMappingProfile()
    {
        CreateMap<TripNote, TripNoteDto>()
            .ForMember(dest => dest.TripActivityName, opt => opt.Ignore());

        CreateMap<CreateTripNoteRequest, TripNote>()
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore());

        CreateMap<UpdateTripNoteRequest, TripNote>()
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore());
    }
}