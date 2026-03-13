using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TodoMappingProfile : Profile
{
    public TodoMappingProfile()
    {
        CreateMap<TodoCategory, TodoCategoryDto>();
        CreateMap<UserTodo, TodoDto>();
        CreateMap<CreateTodoRequest, UserTodo>();
        CreateMap<UpdateTodoRequest, UserTodo>();
    }
}