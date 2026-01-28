using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TemperatureRangeRepository : GenericRepository<TemperatureRange>
{

    public TemperatureRangeRepository(PlantourContext context) : base(context)
    {
    }


}