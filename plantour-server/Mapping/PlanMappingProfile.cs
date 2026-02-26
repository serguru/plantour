using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class PlanMappingProfile : Profile
{
    public PlanMappingProfile()
    {
        CreateMap<Plan, PlanDto>()
            .ForMember(dest => dest.Prices, opt => opt.MapFrom(src => src.Prices));

        CreateMap<Price, PriceDto>()
            .ForMember(dest => dest.PriceEnumId, opt => opt.MapFrom(src => src.PriceEnumId));
    }
}
