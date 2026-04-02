using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripImprovementMappingProfile : Profile
{
    public TripImprovementMappingProfile()
    {
        CreateMap<TripUserImprovement, TripImprovementDto>();

        CreateMap<CreateTripImprovementRequest, TripUserImprovement>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore());

        CreateMap<UpdateTripImprovementRequest, TripUserImprovement>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore());
    }
}