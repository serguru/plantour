
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class CommunicationTypeRepository : GenericRepository<CommunicationType, Guid>, ICommunicationTypeRepository
    {
        public CommunicationTypeRepository(PlantourContext context) : base(context) { }
    }
}
