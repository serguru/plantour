using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class GenderRepository : GenericRepository<Gender>
{

    public GenderRepository(PlantourContext context) : base(context)
    {
    }


}