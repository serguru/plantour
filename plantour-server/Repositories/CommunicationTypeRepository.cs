using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class CommunicationTypeRepository : GenericRepository<CommunicationType>
{

    public CommunicationTypeRepository(PlantourContext context) : base(context)
    {
    }


}