using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class PackageRepository(PlantourContext context) : GenericRepository<UserPackage>(context)
{

    public async Task<UserPackage?> GetByIdAsync(Guid userId, Guid id)
    {
        return await _dbSet
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }

}
