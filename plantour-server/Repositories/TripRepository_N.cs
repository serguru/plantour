using AutoMapper;
using Microsoft.EntityFrameworkCore;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Repositories;

public class TripRepository2(PlantourContext context) : GenericRepository<Trip>(context)
{

}
