using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class AiMappingProfile : Profile
{
    public AiMappingProfile()
    {
        CreateMap<AiThing, AiItemDto>();
        CreateMap<AiPrompt, AiPromptDto>();
        
    }
}
