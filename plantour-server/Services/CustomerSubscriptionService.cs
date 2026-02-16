using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class CustomerSubscriptionService(
    CustomerSubscriptionRepository customerSubscriptionRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : ICustomerSubscriptionService
{
    private readonly CustomerSubscriptionRepository _customerSubscriptionRepository = customerSubscriptionRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    private static DateTime ToTimestampWithoutTimeZone(DateTime value)
    {
        var utc = value.Kind == DateTimeKind.Local
            ? value.ToUniversalTime()
            : value;

        return DateTime.SpecifyKind(utc, DateTimeKind.Unspecified);
    }

    public async Task<IEnumerable<CustomerSubscriptionDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAdmin();

        var entities = await _customerSubscriptionRepository.GetAllForUserAsync(_currentUser.AdminId);
        return _mapper.Map<IEnumerable<CustomerSubscriptionDto>>(entities);
    }

    public async Task<CustomerSubscriptionDto?> GetByIdAsync(Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        var entity = await _customerSubscriptionRepository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<CustomerSubscriptionDto>(entity) : null;
    }

    public async Task<CustomerSubscriptionDto> AddAsync(CreateCustomerSubscriptionRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        var entity = _mapper.Map<CustomerSubscription>(request);
        entity.Id = Guid.NewGuid();
        entity.UserId = _currentUser.AdminId;

        entity.CurrentPeriodStart = ToTimestampWithoutTimeZone(request.CurrentPeriodStart);
        entity.CurrentPeriodEnd = ToTimestampWithoutTimeZone(request.CurrentPeriodEnd);

        var now = ToTimestampWithoutTimeZone(DateTime.UtcNow);
        entity.CreatedAt = now;
        entity.UpdatedAt = now;

        await _customerSubscriptionRepository.AddAsync(entity);
        return _mapper.Map<CustomerSubscriptionDto>(entity);
    }

    public async Task UpdateAsync(UpdateCustomerSubscriptionRequest request)
    {
        _currentUser.RaiseIfNotAdmin();

        var entity = await _customerSubscriptionRepository.GetByIdAsync(request.Id);
        if (entity == null)
        {
            throw new CustomException("Customer subscription not found or access denied");
        }

        _mapper.Map(request, entity);

        entity.CurrentPeriodStart = ToTimestampWithoutTimeZone(request.CurrentPeriodStart);
        entity.CurrentPeriodEnd = ToTimestampWithoutTimeZone(request.CurrentPeriodEnd);
        entity.UpdatedAt = ToTimestampWithoutTimeZone(DateTime.UtcNow);

        await _customerSubscriptionRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        _currentUser.RaiseIfNotAdmin();

        var entity = await _customerSubscriptionRepository.GetByIdAsync(id);
        if (entity == null)
        {
            throw new CustomException("Customer subscription not found or access denied");
        }

        await _customerSubscriptionRepository.DeleteAsync(id);
    }
}
