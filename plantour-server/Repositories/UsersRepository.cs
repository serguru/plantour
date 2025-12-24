using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class UsersRepository(PlantourContext context) : GenericRepository<User>(context)
{
}
