using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripSharedExpenseMappingProfile : Profile
{
    public TripSharedExpenseMappingProfile()
    {
        CreateMap<TripSharedExpense, TripSharedExpenseDto>();

        CreateMap<CreateTripSharedExpenseRequest, TripSharedExpense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore());

        CreateMap<UpdateTripSharedExpenseRequest, TripSharedExpense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Trip, opt => opt.Ignore());
    }
}