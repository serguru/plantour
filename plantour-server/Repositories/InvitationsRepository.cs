using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class InvitationsRepository(PlantourContext context) : GenericRepository<Invitation>(context)
{
}
