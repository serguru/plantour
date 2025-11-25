
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class InvitationRepository : GenericRepository<Invitation, Guid>, IInvitationRepository
    {
        public InvitationRepository(PlantourContext context) : base(context) { }
    }
}
