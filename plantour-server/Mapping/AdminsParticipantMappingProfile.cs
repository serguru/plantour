using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class AdminsParticipantMappingProfile : Profile
{
    public AdminsParticipantMappingProfile()
    {
        CreateMap<AdminsParticipant, AdminsParticipantDto>()
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Participant.Email))
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.Participant.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Participant.LastName))
            .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Participant.Phone));

        CreateMap<UpdateAdminsParticipantRequest, AdminsParticipant>();
    }
}
