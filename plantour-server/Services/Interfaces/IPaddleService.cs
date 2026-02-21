using plantour_server.DTOs;
using plantour_server.Models;

namespace plantour_server.Services;

public interface IPaddleService
{
    Task<string?> GetSubscriptionIdAsync(PaddleSubscriptionIdRequest request);
}
