
using Plantour.Models;
using Plantour.Repositories.Interfaces;

namespace Plantour.Repositories
{
    public class CurrencyRepository : GenericRepository<Currency, Guid>, ICurrencyRepository
    {
        public CurrencyRepository(PlantourContext context) : base(context) { }
    }
}
