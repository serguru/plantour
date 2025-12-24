using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AdminsParticipantRepository2(PlantourContext context) : GenericRepository<AdminsParticipant>(context)
{

    // public async Task<AdminsParticipant?> GetByIdAsync(Guid id)
    // {
    //     if (CurrentUser == null)
    //     {
    //         return null;
    //     }
    //     return await _dbSet     
    //         .Include(x => x.Participant)
    //         .FirstOrDefaultAsync(x => x.Id == id && x.AdminId == CurrentUser.UserId);
    // }

}
