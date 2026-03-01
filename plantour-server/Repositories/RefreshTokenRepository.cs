using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class RefreshTokenRepository(PlantourContext context) : GenericRepository<RefreshToken>(context)
{

}
