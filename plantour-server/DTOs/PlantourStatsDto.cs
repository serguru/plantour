
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using plantour_server.DbModels;

namespace plantour_server.DTOs;

public class Weight
{
    public string Unit {get;set;} = null!;
    public decimal Value {get;set;} = 0;
}

public class Status
{
    public string Name {get;set;} = null!;
    public int Value {get;set;} = 0;
}


public class PlantourStatsDto 
{
    public int Days { get; set; }
    public int Participants { get; set; }
    public int Packs { get; set; }
    public int Things { get; set; }
    public int SharedThings { get; set; }
    public int SharedThingsDone { get; set; }
    public int SharedThingsOverdue { get; set; }
    public List<Weight> PackWeights { get; set; } = null!;
    public List<Status> TripStatuses { get; set; } = null!;
}

public class TripUserStatsDto 
{
    public PlantourStatsDto Trip { get; set; } = null!;
    public PlantourStatsDto User { get; set; } = null!;
}

