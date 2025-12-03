using plantour_server.DbModels;
using plantour_server.DTOs;
using Riok.Mapperly.Abstractions;

namespace plantour_server.Mapping;

[Mapper]
public partial class UserPackageMapper
{
    [MapProperty(nameof(UserPackage.Category.Name), nameof(UserPackageDto.CategoryName))]
    [MapperIgnoreSource(nameof(UserPackage.TripUserPackages))]
    [MapperIgnoreSource(nameof(UserPackage.User))]
    public partial UserPackageDto ToDto(UserPackage entity);
    
    public partial IEnumerable<UserPackageDto> ToDtos(IEnumerable<UserPackage> entities);
    
    [MapperIgnoreTarget(nameof(UserPackage.Id))]
    [MapperIgnoreTarget(nameof(UserPackage.Category))]
    [MapperIgnoreTarget(nameof(UserPackage.TripUserPackages))]
    [MapperIgnoreTarget(nameof(UserPackage.User))]
    public partial UserPackage ToEntity(CreateUserPackageRequest request);
    
    [MapperIgnoreSource(nameof(UpdateUserPackageRequest.PackageId))]
    [MapperIgnoreTarget(nameof(UserPackage.Id))]
    [MapperIgnoreTarget(nameof(UserPackage.UserId))]
    [MapperIgnoreTarget(nameof(UserPackage.Category))]
    [MapperIgnoreTarget(nameof(UserPackage.TripUserPackages))]
    [MapperIgnoreTarget(nameof(UserPackage.User))]
    public partial void UpdateEntity(UpdateUserPackageRequest request, UserPackage entity);
    
}
