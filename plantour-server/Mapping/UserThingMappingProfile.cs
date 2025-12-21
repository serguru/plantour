using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class UserThingMappingProfile : Profile
{
    public UserThingMappingProfile()
    {
        CreateMap<UserThing, ThingDto>();
        
        CreateMap<CreateThingRequest, UserThing>();
        
        CreateMap<UpdateThingRequest, UserThing>();
    }
}
