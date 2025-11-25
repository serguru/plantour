
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class UnitRepository : GenericRepository<Unit, Guid>, IUnitRepository
    {
        public UnitRepository(PlantourContext context) : base(context) { }
    }
}
