using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;
public class CheckAccessService(
    TripRepository tripRepository,
    AdminsParticipantRepository2 adminsParticipantRepository,
    HttpCurrentUser httpCurrentUser
    ) : ICheckAccessService
{
    private readonly TripRepository _tripRepository = tripRepository;
    private readonly AdminsParticipantRepository2 _adminsParticipantRepository = adminsParticipantRepository;
    private readonly CurrentUser _currentUser = httpCurrentUser.CurrentUser;

    public async Task<bool> HasAdminAccessToTripAsync(Guid tripId, Guid userId)
    {
        return await _tripRepository.AnyAsync(t => t.Id == tripId && t.UserId == userId);
    }

    public async Task<bool> HasParticipantAccessToTripAsync(Guid tripId, Guid adminId, Guid participantId)
    {
        bool result = await _tripRepository.AnyAsync(t => t.Id == tripId && t.UserId == adminId);
        if (!result)
        {
            return false;
        }   

        return await _adminsParticipantRepository.AnyAsync(t => t.AdminId == adminId && t.ParticipantId == participantId);
    }

    public async Task<bool> CurrentUserHasAccessToTripAsync(Guid tripId)
    {
        if (_currentUser.IsAdmin)
        {
            return await HasAdminAccessToTripAsync(tripId, _currentUser.UserId);
        }
        else if (_currentUser.IsParticipant)
        {
            return await HasParticipantAccessToTripAsync(tripId, _currentUser.AdminId, _currentUser.UserId);
        }

        return false;
    }

}