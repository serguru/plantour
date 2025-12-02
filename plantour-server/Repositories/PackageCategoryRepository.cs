using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class PackageCategoryRepository : GenericRepository<PackageCategory>
{

    public PackageCategoryRepository(PlantourContext context) : base(context)
    {
    }


}
