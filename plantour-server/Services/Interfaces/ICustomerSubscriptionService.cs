using plantour_server.DTOs;

namespace plantour_server.Services.Interfaces;

public interface ICustomerSubscriptionService
{
    Task<IEnumerable<CustomerSubscriptionDto>> GetAllAsync();
    Task<CustomerSubscriptionDto?> GetByIdAsync(Guid id);
    Task<CustomerSubscriptionDto> AddAsync(CreateCustomerSubscriptionRequest request);
    Task UpdateAsync(UpdateCustomerSubscriptionRequest request);
    Task DeleteAsync(Guid id);
}
