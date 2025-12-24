using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using PlantourApi.Models;

namespace plantour_server.Services;
public interface ICheckAccessService
{
    Task<bool> HasAdminAccessToTripAsync(Guid tripId, Guid userId);
    Task<bool> HasParticipantAccessToTripAsync(Guid tripId, Guid adminId, Guid participantId);
    Task<bool> CurrentUserHasAccessToTripAsync(Guid tripId);
}