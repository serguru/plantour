using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class TemplateRepository(PlantourContext context) : GenericRepository<VTemplateThingsFull>(context)
{
}
