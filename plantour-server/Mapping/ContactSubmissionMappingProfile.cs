using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class ContactSubmissionMappingProfile : Profile
{
    public ContactSubmissionMappingProfile()
    {
        CreateMap<ContactSubmission, ContactSubmissionDto>();
        CreateMap<ContactSubmissionRequest, ContactSubmission>();
    }
}
