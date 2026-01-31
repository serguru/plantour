using plantour_server.DTOs;

namespace plantour_server.Services;

public interface IAiPackingListService
{
    Task<IReadOnlyList<AIItemDto>> GeneratePackingListAsync(string prompt);
}
