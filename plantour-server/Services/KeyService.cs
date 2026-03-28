using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Middleware;
using PlantourApi.Models;

namespace plantour_server.Services;

public class KeyService(
    KeyRepository keyRepository,
    IMapper mapper,
    HttpCurrentUser httpCurrentUser) : IKeyService
{
    private readonly KeyRepository _keyRepository = keyRepository;
    private readonly IMapper _mapper = mapper;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<IEnumerable<KeyDto>> GetAllAsync()
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entities = await _keyRepository.FindAsync(x => x.UserId == _currentUser.UserId);
        return _mapper.Map<IEnumerable<KeyDto>>(entities);
    }

    public async Task<KeyDto?> GetByIdAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();
        var entity = await _keyRepository.GetByIdAsync(_currentUser.UserId, id);
        return entity != null ? _mapper.Map<KeyDto>(entity) : null;
    }

    public async Task<KeyDto> AddAsync(CreateKeyRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var normalizedName = request.Name.Trim();
        var exists = await _keyRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == normalizedName.ToLower());

        if (exists)
        {
            throw new CustomException("Key with the same name already exists");
        }

        var entity = _mapper.Map<UserKey>(request);
        entity.Id = Guid.NewGuid();
        entity.UserId = _currentUser.UserId;
        entity.Name = normalizedName;
        entity.Key = request.Key.Trim();
        await _keyRepository.AddAsync(entity);

        return _mapper.Map<KeyDto>(entity);
    }

    public async Task UpdateAsync(UpdateKeyRequest request)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var entity = await _keyRepository.GetByIdAsync(_currentUser.UserId, request.Id);
        if (entity == null)
        {
            throw new CustomException("Key not found or access denied");
        }

        var normalizedName = request.Name.Trim();
        var exists = await _keyRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Name.ToLower() == normalizedName.ToLower() && x.Id != request.Id);
        if (exists)
        {
            throw new CustomException("Another key with the same name already exists");
        }

        _mapper.Map(request, entity);
        entity.UserId = _currentUser.UserId;
        entity.Name = normalizedName;
        entity.Key = request.Key.Trim();
        await _keyRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        _currentUser.RaiseIfNotAuthenticated();

        var exists = await _keyRepository.AnyAsync(x => x.UserId == _currentUser.UserId && x.Id == id);
        if (!exists)
        {
            throw new CustomException("Key not found or access denied");
        }

        await _keyRepository.DeleteAsync(id);
    }
}