using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class ThingCategoryRepository : GenericRepository<ThingCategory>
{

    public ThingCategoryRepository(PlantourContext context) : base(context)
    {
    }


}
