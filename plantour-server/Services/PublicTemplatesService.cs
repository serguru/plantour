using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;

namespace plantour_server.Services;

public class PublicTemplatesService(
    TemplateRepository templateRepository,
    AgeRangeRepository ageRangeRepository,
    TemperatureRangeRepository temperatureRangeRepository,
    ActivityRepository activityRepository) : IPublicTemplatesService
{
    private readonly TemplateRepository _templateRepository = templateRepository;
    private readonly AgeRangeRepository _ageRangeRepository = ageRangeRepository;
    private readonly TemperatureRangeRepository _temperatureRangeRepository = temperatureRangeRepository;
    private readonly ActivityRepository _activityRepository = activityRepository;

    public async Task<IEnumerable<PublicTemplateThingDto>> GetAllTemplateThingsAsync()
    {
        var entities = await _templateRepository.GetAllAsync();
        return entities.Select(MapTemplateThing);
    }

    public async Task<IEnumerable<PublicTemplateThingDto>> GetTemplateThingsByTemplateIdAsync(Guid templateId)
    {
        var entities = await _templateRepository.FindAsync(x => x.TemplateId == templateId);
        return entities.Select(MapTemplateThing);
    }

    public async Task<IEnumerable<PublicAgeRangeDto>> GetAgeRangesAsync()
    {
        var entities = await _ageRangeRepository.GetAllAsync();
        return entities.Select(x => new PublicAgeRangeDto
        {
            Id = x.Id,
            Name = x.Name,
            FromAge = x.Fromage,
            ToAge = x.Toage,
            Notes = x.Notes
        });
    }

    public async Task<IEnumerable<PublicTemperatureRangeDto>> GetTemperatureRangesAsync()
    {
        var entities = await _temperatureRangeRepository.GetAllAsync();
        return entities.Select(x => new PublicTemperatureRangeDto
        {
            Id = x.Id,
            Name = x.Name,
            FromTemp = x.Fromtemp,
            ToTemp = x.Totemp,
            Notes = x.Notes
        });
    }

    public async Task<IEnumerable<PublicActivityDto>> GetActivitiesAsync()
    {
        var entities = await _activityRepository.GetAllAsync();
        return entities.Select(x => new PublicActivityDto
        {
            Id = x.Id,
            Name = x.Name,
            Notes = x.Notes
        });
    }

    private static PublicTemplateThingDto MapTemplateThing(plantour_server.DbModels.VTemplateThingsFull entity)
    {
        return new PublicTemplateThingDto
        {
            ThingId = entity.ThingId ?? Guid.Empty,
            ThingName = entity.ThingName ?? string.Empty,
            Category = entity.Category,
            Units = entity.Units,
            Value = entity.Value,
            ThingNotes = entity.ThingNotes,
            TemplateId = entity.TemplateId ?? Guid.Empty,
            TemplateName = entity.TemplateName ?? string.Empty,
            ActivityName = entity.ActivityName ?? string.Empty,
            TemperatureRangeName = entity.TemperatureRangeName,
            FromTemp = entity.Fromtemp,
            ToTemp = entity.Totemp,
            AgeRangeName = entity.AgeRangeName,
            FromAge = entity.Fromage,
            ToAge = entity.Toage
        };
    }
}
