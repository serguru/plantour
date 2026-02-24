using plantour_server.DbModels;

namespace plantour_server.Repositories;

public class AiPromptChecksRepository(PlantourContext context) : GenericRepository<AiPromptCheck>(context)
{
    
}