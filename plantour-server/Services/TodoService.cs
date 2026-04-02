using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;
public class TodoService(
    TodoRepository todoRepository,
    TodoCategoryRepository todoCategoryRepository,
    IMapper mapper,
    ICheckAccessService checkAccessService,
    TripTodoRepository tripTodoRepository,
    TripSharedTodoRepository tripSharedTodoRepository,
    HttpCurrentUser httpCurrentUser) : ITodoService
{
    private readonly TodoRepository _todoRepository = todoRepository;
    private readonly TodoCategoryRepository _todoCategoryRepository = todoCategoryRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;
    private readonly ICheckAccessService _checkAccessService = checkAccessService;
    private readonly TripTodoRepository _tripTodoRepository = tripTodoRepository;
    private readonly TripSharedTodoRepository _tripSharedTodoRepository = tripSharedTodoRepository;

    public async Task<IEnumerable<TodoDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _todoRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        return _mapper.Map<IEnumerable<TodoDto>>(entities);
    }

    public async Task<IEnumerable<TodoDto>> GetAllForTripAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripTodos = await _tripTodoRepository.GetAllAsync(_currentUser.AdminId, _currentUser.UserId, tripId);
        var tripTodoNames = new HashSet<string>(tripTodos.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicTodos = await _todoRepository.FindAsync(x => x.UserId == _currentUser.UserId);

        return dicTodos.Select(p =>
        {
            var dto = _mapper.Map<TodoDto>(p);
            dto.IsTargeted = tripTodoNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();
    }

    public async Task<IEnumerable<TodoDto>> GetAllForTripSharedAsync(Guid tripId)
    {
        _currentUser.RaiseIfNotAdmin();

        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new CustomException("User does not have access to this trip");
        }

        var tripSharedTodos = await _tripSharedTodoRepository.GetAllFullAsync(tripId);
        var tripTodoNames = new HashSet<string>(tripSharedTodos.Select(tp => tp.Name), StringComparer.OrdinalIgnoreCase);
        var dicTodos = await _todoRepository.FindAsync(x => x.UserId == _currentUser.UserId);

        return dicTodos.Select(p =>
        {
            var dto = _mapper.Map<TodoDto>(p);
            dto.IsTargeted = tripTodoNames.Contains(p.Name, StringComparer.OrdinalIgnoreCase);
            return dto;
        }).ToList();
    }

    public async Task<TodoDto?> GetByIdAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _todoRepository.GetByIdAsync(_currentUser.UserId, id);
        return entity != null ? _mapper.Map<TodoDto>(entity) : null;
    }

    public async Task<TodoDto> AddAsync(CreateTodoRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        if (await _todoRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower()))
        {
            throw new CustomException("Todo with the same name already exists");
        }

        await CheckAccessAsync(1);
        var entity = _mapper.Map<UserTodo>(request);
        entity.Id = Guid.NewGuid();
        entity.UserId = _currentUser.UserId;
        await _todoRepository.AddAsync(entity);
        return _mapper.Map<TodoDto>(entity);
    }

    public async Task UpdateAsync(UpdateTodoRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _todoRepository.GetByIdAsync(_currentUser.UserId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Todo not found or access denied");
        }

        if (await _todoRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == request.Name.ToLower() && x.Id != request.Id))
        {
            throw new CustomException("Another todo with the same name already exists");
        }

        _mapper.Map(request, entity);
        entity.UserId = _currentUser.UserId;
        await _todoRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var exists = await _todoRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Id == id);
        if (!exists)
        {
            throw new CustomException("Todo not found or access denied");
        }

        await _todoRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<TodoCategoryDto>> GetAllTodoCategoriesAsync()
    {
        var categories = await _todoCategoryRepository.GetAllAsync();
        return categories.Select(c => new TodoCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Notes = c.Notes
        });
    }

    private async Task CheckAccessAsync(int addQty)
    {
        var rule = _currentUser.AccessRules!.FirstOrDefault(x => x.Id == 80);
        if (rule == null || rule.Granted)
        {
            return;
        }

        int limit = rule.Value ?? 0;

        var s1 = $"You've reached the limit of {limit} todos you can add to your trip.";

        var s2 = _currentUser.IsAdmin ? "Please go to your profile page and upgrade your plan to remove this limit." : "Please ask your administrator to upgrade the plan to remove this limit.";


        var currentCount = await _todoRepository.CountAsync(_currentUser.AdminId);
        if (currentCount + addQty > limit)
        {
            throw new CustomException($"{s1} {s2}", "PLAN_LIMIT_REACHED");
        }
    }
}