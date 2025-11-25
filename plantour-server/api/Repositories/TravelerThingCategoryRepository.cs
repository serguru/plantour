
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TravelerThingCategoryRepository : GenericRepository<TravelerThingCategory, Guid>, ITravelerThingCategoryRepository
    {
        public TravelerThingCategoryRepository(PlantourContext context) : base(context) { }
    }
}
