using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class ThingMappingProfile : Profile
{
    public ThingMappingProfile()
    {
        CreateMap<UserThing, ThingDto>();
        
        CreateMap<CreateThingRequest, UserThing>();
        
        CreateMap<UpdateThingRequest, UserThing>();

        CreateMap<VTemplateThingsFull, VTemplateThingsFullDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ThingId))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.ThingName));
    }
}
