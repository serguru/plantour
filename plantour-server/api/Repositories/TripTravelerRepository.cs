
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TripTravelerRepository : GenericRepository<TripTraveler, Guid>, ITripTravelerRepository
    {
        public TripTravelerRepository(PlantourContext context) : base(context) { }
    }
}
