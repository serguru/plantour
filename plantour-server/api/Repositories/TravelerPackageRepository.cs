
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TravelerPackageRepository : GenericRepository<TravelerPackage, Guid>, ITravelerPackageRepository
    {
        public TravelerPackageRepository(PlantourContext context) : base(context) { }
    }
}
