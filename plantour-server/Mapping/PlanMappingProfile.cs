using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Models;

namespace plantour_server.Mapping;

public class PlanMappingProfile : Profile
{
    public PlanMappingProfile()
    {
        CreateMap<Plan, PlanDto>()
            .ForMember(dest => dest.Prices, opt => opt.MapFrom(src => src.Prices));

        CreateMap<Price, PriceDto>();

        CreateMap<PaddlePrice, PriceDto>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.PaddlePriceId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.ValueCents, opt => opt.MapFrom(src => src.UnitPriceAmount));

        CreateMap<PaddleProduct, PlanDto>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.PaddleProductId, opt => opt.MapFrom(src => src.Id));

    }
}
