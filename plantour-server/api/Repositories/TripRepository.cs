
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TripRepository : GenericRepository<Trip, Guid>, ITripRepository
    {
        public TripRepository(PlantourContext context) : base(context) { }
    }
}
