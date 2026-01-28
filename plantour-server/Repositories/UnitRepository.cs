using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class UnitRepository : GenericRepository<Unit>
{

    public UnitRepository(PlantourContext context) : base(context)
    {
    }


}