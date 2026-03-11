using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using System.Linq.Expressions;

namespace plantour_server.Repositories;

public class TemplateRepository(PlantourContext context) : GenericRepository<VTemplateThingsFull>(context)
{
	public override async Task<IEnumerable<VTemplateThingsFull>> GetAllAsync()
	{
		return await _dbSet
			.AsNoTracking()
			.ToListAsync();
	}

	public override async Task<IEnumerable<VTemplateThingsFull>> FindAsync(Expression<Func<VTemplateThingsFull, bool>> predicate)
	{
		return await _dbSet
			.AsNoTracking()
			.Where(predicate)
			.ToListAsync();
	}
}
