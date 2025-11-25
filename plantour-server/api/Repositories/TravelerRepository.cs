
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class TravelerRepository : GenericRepository<Traveler, Guid>, ITravelerRepository
    {
        public TravelerRepository(PlantourContext context) : base(context) { }
    }
}
