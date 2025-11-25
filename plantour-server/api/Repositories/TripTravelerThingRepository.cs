
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TripTravelerThingRepository : GenericRepository<TripTravelerThing, Guid>, ITripTravelerThingRepository
    {
        public TripTravelerThingRepository(PlantourContext context) : base(context) { }
    }
}
