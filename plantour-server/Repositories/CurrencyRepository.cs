using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class CurrencyRepository(PlantourContext context) : GenericRepository<Currency>(context)
{
}