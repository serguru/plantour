
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class UnitCategoryRepository : GenericRepository<UnitCategory, Guid>, IUnitCategoryRepository
    {
        public UnitCategoryRepository(PlantourContext context) : base(context) { }
    }
}
