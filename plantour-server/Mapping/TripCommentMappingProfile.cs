using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripCommentMappingProfile : Profile
{
    public TripCommentMappingProfile()
    {

        CreateMap<TripComment, TripCommentDto>()
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.FirstName, opt => opt.Ignore())
            .ForMember(dest => dest.LastName, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore());

        CreateMap<CreateTripCommentRequest, TripComment>();
        CreateMap<UpdateTripCommentRequest, TripComment>();
    }
}
