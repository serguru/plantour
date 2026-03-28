using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripActivityMappingProfile : Profile
{
    public TripActivityMappingProfile()
    {
        CreateMap<TripActivity, TripActivityDto>();
        CreateMap<CreateTripActivityRequest, TripActivity>();
        CreateMap<UpdateTripActivityRequest, TripActivity>();
        
    }
}
