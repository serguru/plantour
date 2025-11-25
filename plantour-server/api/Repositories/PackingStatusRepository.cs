
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class PackingStatusRepository : GenericRepository<PackingStatus, Guid>, IPackingStatusRepository
    {
        public PackingStatusRepository(PlantourContext context) : base(context) { }
    }
}
