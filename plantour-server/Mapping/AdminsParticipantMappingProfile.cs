using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class AdminsParticipantMappingProfile : Profile
{
    public AdminsParticipantMappingProfile()
    {
        CreateMap<AdminsParticipant, AdminsParticipantDto>();
        
        CreateMap<UpdateAdminsParticipantRequest, AdminsParticipant>()
            .ForMember(dest => dest.AdminId, opt => opt.Ignore())
            .ForMember(dest => dest.AccessCode, opt => opt.Ignore())
            .ForMember(dest => dest.Admin, opt => opt.Ignore())
            .ForMember(dest => dest.Participant, opt => opt.Ignore())
            .ForMember(dest => dest.TripUsers, opt => opt.Ignore());
    }
}
