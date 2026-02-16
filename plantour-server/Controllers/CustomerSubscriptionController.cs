using Microsoft.AspNetCore.Mvc;
using plantour_server.Attributes;
using plantour_server.DTOs;
using plantour_server.Services.Interfaces;

namespace plantour_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerSubscriptionController : ControllerBase
{
    private readonly ICustomerSubscriptionService _service;

    public CustomerSubscriptionController(ICustomerSubscriptionService service)
    {
        _service = service;
    }

    [HttpGet]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<CustomerSubscriptionDto>>> GetAll()
    {
        var dtos = await _service.GetAllAsync();
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [AdminOnly]
    public async Task<ActionResult<CustomerSubscriptionDto>> GetById(Guid id)
    {
        var dto = await _service.GetByIdAsync(id);
        if (dto == null)
        {
            return NotFound(new { message = "Customer subscription not found" });
        }

        return Ok(dto);
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<CustomerSubscriptionDto>> Add([FromBody] CreateCustomerSubscriptionRequest request)
    {
        var dto = await _service.AddAsync(request);
        return Ok(dto);
    }

    [HttpPut]
    [AdminOnly]
    public async Task<ActionResult> Update([FromBody] UpdateCustomerSubscriptionRequest request)
    {
        await _service.UpdateAsync(request);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
