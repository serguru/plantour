using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using plantour_maintenance_server.DTOs;
using plantour_maintenance_server.Middleware;
using plantour_maintenance_server.Services.Interfaces;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace plantour_maintenance_server.Controllers;

[ApiController]
[Route("users")]
public class UsersController(IUsersService usersService, IPlantourUsersService plantourUsersService) : ControllerBase
{
    private readonly IUsersService _usersService = usersService;
    private readonly IPlantourUsersService _plantourUsersService = plantourUsersService;

    [HttpGet("health-check")]
    [AllowAnonymous]
    public IActionResult GetHealthCheck()
    {
        return Ok(new { status = "Plantour Maintenance API OK" });
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await _usersService.GetAllAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("plantour")]
    public async Task<ActionResult<IReadOnlyList<PlantourUserRowDto>>> GetPlantourUsers(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        CancellationToken cancellationToken)
    {
        if (from.HasValue != to.HasValue)
        {
            await ErrorResponse.WriteErrorResponse(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "INVALID_PERIOD",
                "Both from and to must be specified when filtering users by created_at.");

            return new EmptyResult();
        }

        if (from.HasValue && to.HasValue && from > to)
        {
            await ErrorResponse.WriteErrorResponse(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "INVALID_PERIOD",
                "The end of the period must be later than or equal to the start.");

            return new EmptyResult();
        }

        var users = await _plantourUsersService.GetAllAsync(from, to, cancellationToken);
        return Ok(users);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrent(CancellationToken cancellationToken)
    {
        var user = await _usersService.GetCurrentAsync(cancellationToken);
        return Ok(user);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _usersService.GetByIdAsync(id, cancellationToken);
        return Ok(user);
    }

    [HttpGet("{id:guid}/comprehensive")]
    [AllowAnonymous]
    public async Task<ActionResult<string>> GetComprehensiveData(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userData = await _plantourUsersService.GetComprehensiveDataAsync(id, cancellationToken);

        // Serialize the data to JSON on the server to avoid serialization issues
        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = ReferenceHandler.IgnoreCycles,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            MaxDepth = 32,
            WriteIndented = true,
            Converters = { new IPAddressConverter() }
        };

        var json = JsonSerializer.Serialize(userData, jsonOptions);

        return Ok(json);
    }

    private class IPAddressConverter : JsonConverter<IPAddress>
    {
        public override IPAddress? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var ipString = reader.GetString();
            return ipString != null ? IPAddress.Parse(ipString) : null;
        }

        public override void Write(Utf8JsonWriter writer, IPAddress value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value?.ToString());
        }

        public override bool CanConvert(Type typeToConvert)
        {
            // Handle both IPAddress and nullable IPAddress
            return typeToConvert == typeof(IPAddress) ||
                   (typeToConvert.IsGenericType &&
                    typeToConvert.GetGenericTypeDefinition() == typeof(Nullable<>) &&
                    typeToConvert.GetGenericArguments()[0] == typeof(IPAddress));
        }
    }
}