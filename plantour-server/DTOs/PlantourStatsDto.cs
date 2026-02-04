
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



