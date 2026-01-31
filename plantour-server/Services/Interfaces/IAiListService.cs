using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAiService
{
    Task<IEnumerable<AiItemDto>> GenerateListAsync(string prompt);
}
