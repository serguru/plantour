
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TravelerPackageCategoryRepository : GenericRepository<TravelerPackageCategory, Guid>, ITravelerPackageCategoryRepository
    {
        public TravelerPackageCategoryRepository(PlantourContext context) : base(context) { }
    }
}
