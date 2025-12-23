using AutoMapper;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TripRepository(PlantourContext context) : GenericRepository<Trip>(context)
{

    public async Task<IEnumerable<Trip>> GetAllFullByIdAsync()
    {       
        return await  _dbSet
            .Include(x => x.TripUsers)
            .ThenInclude(x => x.TripUserPackages)
            .ThenInclude(x => x.TripUserThings)
            .ToListAsync(); 
    }

    

}
