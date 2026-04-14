using AutoMapper;
using plantour_server.DbModels;
using plantour_maintenance_server.DTOs;

namespace plantour_maintenance_server.Mapping;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<Superuser, UserDto>();
    }
}