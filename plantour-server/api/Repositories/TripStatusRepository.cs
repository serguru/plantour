
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TripStatusRepository : GenericRepository<TripStatus, Guid>, ITripStatusRepository
    {
        public TripStatusRepository(PlantourContext context) : base(context) { }
    }
}
