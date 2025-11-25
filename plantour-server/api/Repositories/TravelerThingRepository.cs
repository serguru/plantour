
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TravelerThingRepository : GenericRepository<TravelerThing, Guid>, ITravelerThingRepository
    {
        public TravelerThingRepository(PlantourContext context) : base(context) { }
    }
}
