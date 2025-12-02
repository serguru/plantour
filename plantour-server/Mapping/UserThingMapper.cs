using plantour_server.DbModels;
using plantour_server.DTOs;
using Riok.Mapperly.Abstractions;

namespace plantour_server.Mapping;

[Mapper]
public partial class UserThingMapper
{
    [MapProperty(nameof(UserThing.Category.Name), nameof(UserThingDto.CategoryName))]
    public partial UserThingDto ToDto(UserThing entity);
    
    public partial IEnumerable<UserThingDto> ToDtos(IEnumerable<UserThing> entities);
    
    public partial UserThing ToEntity(CreateUserThingRequest request);
    
    public partial void UpdateEntity(UpdateUserThingRequest request, UserThing entity);
    
}
