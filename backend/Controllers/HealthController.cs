using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallShopInventoryBillingAPI.Data;
using SmallShopInventoryBillingAPI.DTOs;

namespace SmallShopInventoryBillingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public HealthController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Checks the health status of the API service and database connectivity.
    /// </summary>
    /// <returns>Health status details.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(HealthResponseDto))]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable, Type = typeof(HealthResponseDto))]
    public async Task<IActionResult> GetHealth()
    {
        bool canConnect = false;
        try
        {
            canConnect = await _dbContext.Database.CanConnectAsync();
        }
        catch
        {
            canConnect = false;
        }

        if (!canConnect)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new HealthResponseDto
            {
                Status = "Unhealthy",
                Service = "SmallShopInventoryBillingAPI"
            });
        }

        return Ok(new HealthResponseDto
        {
            Status = "Healthy",
            Service = "SmallShopInventoryBillingAPI"
        });
    }
}
