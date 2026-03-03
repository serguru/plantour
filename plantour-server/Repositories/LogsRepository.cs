using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class LogsRepository(PlantourContext context) : GenericRepository<Log>(context)
{

}
