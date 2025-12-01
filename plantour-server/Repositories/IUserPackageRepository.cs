using plantour_server.Models;

namespace plantour_server.Repositories;

public interface IUserPackageRepository
{
    Task<List<UserPackage>> GetAllByUserIdAsync(Guid? userId = null);
    Task<UserPackage?> GetByIdAsync(Guid id, Guid? userId = null);
    Task<UserPackage> CreateAsync(UserPackage userPackage);
    Task<UserPackage?> UpdateAsync(UserPackage userPackage);
    Task<bool> DeleteAsync(Guid id, Guid? userId = null);
}
