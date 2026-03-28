using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class ItineraryPartMappingProfile : Profile
{
    public ItineraryPartMappingProfile()
    {
        CreateMap<ItineraryPart, ItineraryPartDto>();

        CreateMap<CreateItineraryPartRequest, ItineraryPart>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore())
            .ForMember(dest => dest.TripActivities, opt => opt.Ignore());

        CreateMap<UpdateItineraryPartRequest, ItineraryPart>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore())
            .ForMember(dest => dest.TripActivities, opt => opt.Ignore());
    }
}