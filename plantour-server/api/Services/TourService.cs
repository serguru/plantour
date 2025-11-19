using System;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Plantour.Infrastructure.Dtos;
using Plantour.Models;
using Plantour.Repositories;

namespace Plantour.Services;

public class TourService : ITourService
{
    private readonly ITourRepository _repository;
    private readonly IJsonPatchManager _patchManager;

    public TourService(ITourRepository repository, IJsonPatchManager patchManager)
    {
        _repository = repository;
        _patchManager = patchManager;
    }

    public async Task<Tour> CreateAsync(CreateTourRequest request, CancellationToken cancellationToken = default)
    {
        var tour = new Tour
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Status = request.Status,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TourData = request.TourData.GetRawText(),
            Version = 1,
            CreatedAt = DateTime.UtcNow
        };

        return await _repository.AddAsync(tour, cancellationToken);
    }

    public async Task<Tour?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _repository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Tour> ApplyPatchAsync(Guid id, ApplyTourPatchRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);
        if (existing == null)
            throw new KeyNotFoundException($"Tour '{id}' not found.");

        if (existing.Version != request.ExpectedVersion)
            throw new DbUpdateConcurrencyException($"Version mismatch. Current version is {existing.Version}.");

        var rootNode = string.IsNullOrWhiteSpace(existing.TourData)
            ? new JsonObject()
            : JsonNode.Parse(existing.TourData) ?? new JsonObject();

        rootNode = _patchManager.ApplyPatch(rootNode, request.Operations);

        existing.TourData = rootNode.ToJsonString(new JsonSerializerOptions
        {
            WriteIndented = false
        });

        existing.Version += 1;

        return await _repository.UpdateAsync(existing, cancellationToken);
    }
}
