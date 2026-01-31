using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAiService
{
    Task<IReadOnlyList<AIItemDto>> GenerateListAsync(string prompt);
}
