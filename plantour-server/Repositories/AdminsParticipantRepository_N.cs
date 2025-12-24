using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AdminsParticipantRepository2(PlantourContext context) : GenericRepository<AdminsParticipant>(context)
{
}
