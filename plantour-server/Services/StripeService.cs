using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Utils;
using PlantourApi.Middleware;
using PlantourApi.Models;
namespace plantour_server.Services;

public class StripeService : IStripeService
{
    private readonly string _secretKey;
    private readonly string _publishableKey;
    
    public StripeService(IConfiguration configuration)
    {
    }
    

}
