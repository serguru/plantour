using plantour_server.DbModels;
using plantour_server.DTOs;
using Riok.Mapperly.Abstractions;

namespace plantour_server.Mapping;

[Mapper]
public partial class UserPackageMapper
{
    public partial UserPackageDto ToDto(UserPackage entity);
    
    public partial IEnumerable<UserPackageDto> ToDtos(IEnumerable<UserPackage> entities);
    
    public partial UserPackage ToEntity(CreateUserPackageRequest request);
    
    public partial void UpdateEntity(UpdateUserPackageRequest request, UserPackage entity);
}
