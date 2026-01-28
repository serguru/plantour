using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripStatusRepository : GenericRepository<TripStatus>
{

    public TripStatusRepository(PlantourContext context) : base(context)
    {
    }


}