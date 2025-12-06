using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class LookupsMappingProfile : Profile
{
    public LookupsMappingProfile()
    {
        CreateMap<PackingStatus, PackingStatusDto>();
        CreateMap<CommunicationType, CommunicationTypeDto>();
        CreateMap<ThingCategory, ThingCategoryDto>();
        CreateMap<TripStatus, TripStatusDto>();
        CreateMap<ParticipantStatus, ParticipantStatusDto>();
        CreateMap<Unit, UnitDto>();
    }
}
